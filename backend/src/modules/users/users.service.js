const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

async function createUser({ name, email, password, role }) {
  const roleResult = await pool.query(
    'SELECT id FROM roles WHERE name = $1',
    [role]
  );
  if (roleResult.rowCount === 0) {
    throw new Error('Rol inválido');
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email`,
    [name, email, hash, roleResult.rows[0].id]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.email,
      u.password,
      u.active,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
    `,
    [email]
  );

  return result.rows[0];
}

async function listUsers() {
  const result = await pool.query(
    `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.active, 
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ORDER BY u.id
    `
  );
  return result.rows;
}

async function setActive(id, active) {
  await pool.query(
    'UPDATE users SET active = $1 WHERE id = $2',
    [active, id]
  );
}

/**
 * USADO POR PIPELINE / LÓGICA VIEJA
 */
async function listVendors() {
  const result = await pool.query(
    `
    SELECT u.id, u.name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.name = 'VENDEDOR'
      AND u.active = true
    ORDER BY u.name
    `
  );
  return result.rows;
}

/**
 * 👉 USADO POR NUEVO PRESUPUESTO
 * VENDEDOR + SUPERVISOR
 * ADMIN EXCLUIDO
 */
async function listAssignableUsers() {
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.name,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.name IN ('VENDEDOR', 'SUPERVISOR')
      AND u.active = true
    ORDER BY u.name
    `
  );

  return result.rows;
}

module.exports = {
  createUser,
  findByEmail,
  listUsers,
  listVendors,
  listAssignableUsers,
  setActive,
};
