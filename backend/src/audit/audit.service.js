const pool = require('../config/db');

const logAudit = async ({ action, targetUserId, performedBy }) => {
  await pool.query(
    `
    INSERT INTO users_audit (action, target_user_id, performed_by)
    VALUES ($1, $2, $3)
    `,
    [action, targetUserId, performedBy]
  );
};

module.exports = { logAudit };
