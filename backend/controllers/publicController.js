const db = require('../config/db');

exports.submitPublicRequest = async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO maintenance_requests (title, description, priority, status)
       VALUES ($1, $2, $3, 'PENDING') RETURNING id, title, priority, status, created_at`,
      [title.trim(), description || null, (priority || 'MEDIUM').toUpperCase()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
