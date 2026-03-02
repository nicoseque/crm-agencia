const pool = require('../database/db');

/**
 * ⚠️ DEPRECADO
 */
async function getActiveByClient() {
  return null;
}

/**
 * Obtener presupuesto por ID
 */
async function getById(id) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM quotes
    WHERE id = $1
    `,
    [id]
  );
  return rows[0] || null;
}

/**
 * Crear presupuesto
 */
async function createQuote(data) {
  const {
    seller_id,
    client_dni,
    client_first_name,
    client_last_name,
    interest_type,
    product,
    description,
    total_amount,
    currency,

    // 👉 NUEVOS CAMPOS PLAN
    installments_qty,
    installment_pure,
    installment_final,
    retiro_from_installment,
    mechanisms,
    retiro_costs,
    adjudication_programmed,

    // 👉 USADO
    has_used_vehicle,
    vehicle_brand,
    vehicle_model,
    vehicle_version,
    vehicle_year,
    vehicle_price,

    // 👉 BENEFICIOS
    benefits
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

      installments_qty,
      installment_pure,
      installment_final,
      retiro_from_installment,
      mechanisms,
      retiro_costs,
      adjudication_programmed,

      has_used_vehicle,
      vehicle_brand,
      vehicle_model,
      vehicle_version,
      vehicle_year,
      vehicle_price,

      benefits,
      status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15,$16,
      $17,$18,$19,$20,$21,$22,
      $23,
      'BORRADOR'
    )
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
      currency || 'ARS',

      installments_qty || null,
      installment_pure || null,
      installment_final || null,
      retiro_from_installment || null,
      mechanisms || null,
      retiro_costs || null,
      adjudication_programmed || null,

      has_used_vehicle || false,
      vehicle_brand || null,
      vehicle_model || null,
      vehicle_version || null,
      vehicle_year || null,
      vehicle_price || null,

      benefits || null
    ]
  );

  return rows[0];
}
/**
 * Enviar presupuesto
 */
async function sendQuote(id, userId) {
  const { rows } = await pool.query(
    `
    UPDATE quotes
    SET
      status = 'ENVIADO',
      supervisor_id = $2,
      sent_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [id, userId]
  );

  return rows[0];
}

/**
 * ACTUALIZAR STATUS
 * 👉 si es APROBADO, guarda FECHA DE NEGOCIO (no UTC)
 */
async function updateStatus(id, status) {
  let query;
  let params;

  if (status === 'APROBADO') {
    query = `
      UPDATE quotes
      SET
        status = $2,
        resolved_at = CURRENT_DATE
      WHERE id = $1
      RETURNING *
    `;
    params = [id, status];
  } else {
    query = `
      UPDATE quotes
      SET status = $2
      WHERE id = $1
      RETURNING *
    `;
    params = [id, status];
  }

  const { rows } = await pool.query(query, params);
  return rows[0];
}

module.exports = {
  getActiveByClient,
  getById,
  createQuote,
  sendQuote,
  updateStatus
};
