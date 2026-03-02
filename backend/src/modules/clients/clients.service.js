const pool = require('../../config/db');

// Campos permitidos para update
const UPDATABLE_FIELDS = [
  'dni',
  'name',
  'last_name',
  'phone',
  'email',
  'notes',
  'address',
  'birth_date'
];

/**
 * Crear cliente
 */
async function create(
  {
    dni,
    name,
    last_name,
    email,
    phone,
    address,
    notes,
    birth_date
  },
  userId
) {
  const result = await pool.query(
    `
    INSERT INTO clients
      (
        dni,
        name,
        last_name,
        phone,
        email,
        address,
        notes,
        birth_date,
        active,
        created_by
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
    RETURNING *
    `,
    [
      dni || null,
      name,
      last_name,
      phone || null,
      email || null,
      address || null,
      notes || null,
      birth_date || null,
      userId
    ]
  );

  return result.rows[0];
}

/**
 * Listar clientes SEGÚN ROL
 */
async function findAllByUser(user) {
  // ADMIN → todos
  if (user.role === 'ADMIN') {
    const result = await pool.query(
      `
      SELECT *
      FROM clients
      WHERE active IS NOT FALSE
      ORDER BY last_name ASC, name ASC
      `
    );
    return result.rows;
  }

  // SUPERVISOR → los suyos + equipo
  if (user.role === 'SUPERVISOR') {
    const result = await pool.query(
      `
      SELECT c.*
      FROM clients c
      JOIN users u ON u.id = c.created_by
      WHERE c.active IS NOT FALSE
        AND (
          c.created_by = $1
          OR u.supervisor_id = $1
        )
      ORDER BY c.last_name ASC, c.name ASC
      `,
      [user.id]
    );
    return result.rows;
  }

  // VENDEDOR → solo los suyos
  const result = await pool.query(
    `
    SELECT *
    FROM clients
    WHERE active IS NOT FALSE
      AND created_by = $1
    ORDER BY last_name ASC, name ASC
    `,
    [user.id]
  );

  return result.rows;
}

/**
 * Obtener cliente por ID
 */
async function findById(id) {
  const result = await pool.query(
    `SELECT * FROM clients WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

/**
 * Buscar cliente por DNI
 */
async function findByDni(dni) {
  const result = await pool.query(
    `
    SELECT *
    FROM clients
    WHERE dni = $1
      AND active IS NOT FALSE
    LIMIT 1
    `,
    [dni]
  );

  return result.rows[0];
}

/**
 * Actualizar cliente
 */
async function update(id, data) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const field of UPDATABLE_FIELDS) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${index}`);
      values.push(data[field]);
      index++;
    }
  }

  if (fields.length === 0) {
    return findById(id);
  }

  const query = `
    UPDATE clients
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Desactivar cliente (soft delete)
 */
async function deactivate(id) {
  const result = await pool.query(
    `
    UPDATE clients
    SET active = false
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  create,
  findAllByUser,
  findById,
  findByDni,
  update,
  deactivate
};