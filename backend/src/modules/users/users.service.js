const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

/**
 * CREAR USUARIO
 */
async function createUser({ name, email, password, role, supervisor_id = null }) {
  const roleResult = await pool.query(
    'SELECT id FROM roles WHERE name = $1',
    [role]
  );

  if (roleResult.rowCount === 0) {
    throw new Error('Rol inválido');
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role_id, supervisor_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email
    `,
    [name, email, hash, roleResult.rows[0].id, supervisor_id]
  );

  return result.rows[0];
}

/**
 * LOGIN
 */
async function findByEmail(email) {
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.email,
      u.password,
      u.active,
      u.supervisor_id,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
    `,
    [email]
  );

  return result.rows[0];
}

/**
 * LISTAR USUARIOS
 */
async function listUsers(user) {
  // ADMIN
  if (user.role === 'ADMIN') {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.active,
        u.supervisor_id,
        s.name AS supervisor_name,
        r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN users s ON s.id = u.supervisor_id
      ORDER BY u.id
      `
    );
    return result.rows;
  }

  // SUPERVISOR
  if (user.role === 'SUPERVISOR') {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.active,
        u.supervisor_id,
        s.name AS supervisor_name,
        r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN users s ON s.id = u.supervisor_id
      WHERE u.supervisor_id = $1
      ORDER BY u.id
      `,
      [user.id]
    );
    return result.rows;
  }

  return [];
}

/**
 * ACTIVAR / DESACTIVAR USUARIO
 */
async function setActive(id, active) {
  await pool.query(
    'UPDATE users SET active = $1 WHERE id = $2',
    [active, id]
  );
}

/**
 * SOLO VENDEDORES
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
 * USUARIOS ASIGNABLES A PRESUPUESTOS
 */
async function listAssignableUsers(user) {
  // ADMIN → todos los vendedores y supervisores
  if (user.role === 'ADMIN') {
    const result = await pool.query(
      `
      SELECT u.id, u.name, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.name IN ('VENDEDOR', 'SUPERVISOR')
        AND u.active = true
      ORDER BY u.name
      `
    );
    return result.rows;
  }

  // SUPERVISOR → él mismo + sus vendedores
  if (user.role === 'SUPERVISOR') {
    const result = await pool.query(
      `
      SELECT u.id, u.name, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE (u.supervisor_id = $1 OR u.id = $1)
        AND u.active = true
      ORDER BY u.name
      `,
      [user.id]
    );
    return result.rows;
  }

  // VENDEDOR → solo él mismo
  if (user.role === 'VENDEDOR') {
    const result = await pool.query(
      `
      SELECT u.id, u.name, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1
        AND u.active = true
      `,
      [user.id]
    );
    return result.rows;
  }

  return [];
}

module.exports = {
  createUser,
  findByEmail,
  listUsers,
  listVendors,
  listAssignableUsers,
  setActive,
};