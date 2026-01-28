const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const pool = require('../config/db');

router.get('/users', auth(['ADMIN']), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT 
      a.id,
      a.action,
      a.created_at,
      tu.name AS target_user,
      pu.name AS performed_by
    FROM users_audit a
    JOIN users tu ON tu.id = a.target_user_id
    JOIN users pu ON pu.id = a.performed_by
    ORDER BY a.created_at DESC
  `);

  res.json(rows);
});

module.exports = router;
