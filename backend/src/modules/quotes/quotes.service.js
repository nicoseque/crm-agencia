const pool = require('../../config/db');

/**
 * CREAR PRESUPUESTO
 */
async function create(userId, data) {
  const {
    seller_id,
    client_dni,
    client_first_name,
    client_last_name,
    interest_type,
    product,
    description,
    total_amount,
    currency
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO quotes (
      seller_id,
      client_dni,
      client_first_name,
      client_last_name,
      interest_type,
      product,
      description,
      total_amount,
      currency,
      status,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'BORRADOR', NOW())
    RETURNING *
    `,
    [
      seller_id,
      client_dni,
      client_first_name,
      client_last_name,
      interest_type,
      product,
      description,
      total_amount,
      currency
    ]
  );

  return rows[0];
}

/**
 * LISTAR
 */
async function list(user) {
  const { rows } = await pool.query(`SELECT * FROM quotes`);
  return rows;
}

/**
 * ACTUALIZAR STATUS
 */
async function updateStatus(quoteId, status) {
  await pool.query(
    `
    UPDATE quotes
    SET status = $1::varchar
    WHERE id = $2::int
    `,
    [status, quoteId]
  );
}

/**
 * ENVIAR
 */
async function send(id, userId) {
  await pool.query(
    `
    UPDATE quotes
    SET status = 'ENVIADO',
        supervisor_id = $2,
        sent_at = NOW()
    WHERE id = $1
    `,
    [id, userId]
  );
}

/**
 * OBTENER POR ID (PDF)
 */
async function getById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM quotes WHERE id = $1`,
    [id]
  );
  return rows[0];
}

module.exports = {
  create,
  list,
  updateStatus,
  send,
  getById
};
