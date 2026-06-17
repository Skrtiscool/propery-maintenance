const jwt = require('jsonwebtoken');

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Token' });
    }
  };
};

module.exports = { authorize };
