const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function auth() {
  return async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { rows } = await pool.query(
        `
        SELECT u.id, u.role_id, u.supervisor_id, r.name AS role
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1
          AND u.active IS NOT FALSE
        `,
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Usuario inválido' });
      }

      const user = rows[0];

      req.user = {
        id: user.id,
        role_id: user.role_id,
        role: user.role,
        supervisor_id: user.supervisor_id
      };

      next();
    } catch (error) {
      console.error('❌ AUTH ERROR:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
}

module.exports = auth;