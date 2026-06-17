const db = require('../config/db');

exports.getRequests = async (req, res) => {
  const { status, priority, assigned_to } = req.query;

  try {
    let query;
    const params = [];

    if (req.user.role === 'WORKER') {
      query = `SELECT * FROM maintenance_requests WHERE assigned_to = $1`;
      params.push(req.user.id);
      let idx = 2;
      if (status) { query += ` AND status = $${idx++}`; params.push(status); }
      if (priority) { query += ` AND priority = $${idx++}`; params.push(priority); }
      query += ' ORDER BY created_at DESC';
      const result = await db.query(query, params);
      res.json(result.rows.filter((r) => r.status !== 'PENDING'));
      return;
    }

    query = `
      SELECT mr.*, u.unit_number, b.name as building_name, p.name as property_name,
             creator.full_name as created_by_name, assignee.full_name as assigned_to_name
      FROM maintenance_requests mr
      LEFT JOIN units u ON mr.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN properties p ON b.property_id = p.id
      LEFT JOIN users creator ON mr.created_by = creator.id
      LEFT JOIN users assignee ON mr.assigned_to = assignee.id
      WHERE 1=1
    `;
    let idx = 1;

    if (status) {
      query += ` AND mr.status = $${idx++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND mr.priority = $${idx++}`;
      params.push(priority);
    }
    if (assigned_to) {
      query += ` AND mr.assigned_to = $${idx++}`;
      params.push(assigned_to);
    }

    query += ' ORDER BY mr.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT mr.*, u.unit_number, b.name as building_name, p.name as property_name,
              creator.full_name as created_by_name, assignee.full_name as assigned_to_name
       FROM maintenance_requests mr
       LEFT JOIN units u ON mr.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN properties p ON b.property_id = p.id
       LEFT JOIN users creator ON mr.created_by = creator.id
       LEFT JOIN users assignee ON mr.assigned_to = assignee.id
       WHERE mr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const photos = await db.query(
      'SELECT * FROM photos WHERE request_id = $1 ORDER BY uploaded_at',
      [id]
    );

    res.json({ ...result.rows[0], photos: photos.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createRequest = async (req, res) => {
  const { title, description, priority, unit_id } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO maintenance_requests (title, description, priority, unit_id, created_by, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING *`,
      [title, description, priority || 'MEDIUM', unit_id, req.user.id]
    );

    await db.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'REQUEST_CREATED', JSON.stringify({ request_id: result.rows[0].id })]
    );

    if (req.io && (priority === 'HIGH' || priority === 'EMERGENCY')) {
      req.io.emit('high-priority-request', result.rows[0]);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validTransitions = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['ASSIGNED', 'REJECTED'],
    ASSIGNED: ['IN_PROGRESS'],
    IN_PROGRESS: ['WAITING_PARTS', 'COMPLETED'],
    WAITING_PARTS: ['IN_PROGRESS'],
    COMPLETED: ['CLOSED'],
  };

  try {
    const current = await db.query('SELECT status FROM maintenance_requests WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const currentStatus = current.rows[0].status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition from ${currentStatus} to ${status}`,
      });
    }

    const result = await db.query(
      `UPDATE maintenance_requests
       SET status = $1, completion_notes = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, notes, id]
    );

    await db.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'STATUS_UPDATE', JSON.stringify({ request_id: id, new_status: status })]
    );

    if (req.io) {
      req.io.emit('request-status-update', result.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignRequest = async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  try {
    const result = await db.query(
      `UPDATE maintenance_requests
       SET assigned_to = $1, status = 'ASSIGNED', updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await db.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'REQUEST_ASSIGNED', JSON.stringify({ request_id: id, assigned_to })]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadPhoto = async (req, res) => {
  const { id } = req.params;
  const { photo_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const result = await db.query(
      'INSERT INTO photos (request_id, url, photo_type) VALUES ($1, $2, $3) RETURNING *',
      [id, `/uploads/${req.file.filename}`, photo_type || 'BEFORE']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
