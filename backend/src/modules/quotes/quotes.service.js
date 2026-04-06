const pool = require('../../config/db');

/**
 * OBTENER PRESUPUESTO POR ID
 */
async function getById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM quotes WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * CREAR PRESUPUESTO
 */
async function create(data) {
  const {
    seller_id,
    client_dni,
    client_first_name,
    client_last_name,
    phone, // 🔥 viene del front
    interest_type,
    product,
    description,
    total_amount,
    currency,

    installments_qty,
    installment_final,
    installment_pure,
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

    payment_method,
    card_number,
    card_expiry,
    card_cvv,
    save_card
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO quotes (
      seller_id,
      client_dni,
      client_first_name,
      client_last_name,
      client_phone, -- 🔥 CORRECTO
      interest_type,
      product,
      description,
      total_amount,
      currency,
      installments_qty,
      installment_final,
      installment_pure,
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
      payment_method,
      card_number,
      card_expiry,
      card_cvv,
      save_card,
      status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,
      $18,$19,$20,$21,$22,
      $23,
      $24,$25,$26,$27,$28,
      'BORRADOR'
    )
    RETURNING *
    `,
    [
      seller_id,
      client_dni,
      client_first_name,
      client_last_name,
      phone || null, // 🔥 GUARDA EN client_phone
      interest_type,
      product,
      description,
      total_amount,
      currency || 'ARS',

      installments_qty,
      installment_final,
      installment_pure,
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

      payment_method,
      card_number,
      card_expiry,
      card_cvv,
      save_card
    ]
  );

  return rows[0];
}

/**
 * ENVIAR PRESUPUESTO
 */
async function send(id, userId) {
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
 * LISTAR PRESUPUESTOS SEGÚN ROL
 */
async function list(user) {
  if (!user) throw new Error('Usuario requerido');

  if (user.role_id === 1) {
    const { rows } = await pool.query(
      `SELECT * FROM quotes ORDER BY created_at DESC`
    );
    return rows;
  }

  if (user.role_id === 2) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM quotes
      WHERE seller_id = $1
         OR seller_id IN (
           SELECT id FROM users WHERE supervisor_id = $1
         )
      ORDER BY created_at DESC
      `,
      [user.id]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `
    SELECT *
    FROM quotes
    WHERE seller_id = $1
    ORDER BY created_at DESC
    `,
    [user.id]
  );

  return rows;
}

/**
 * BUSCAR PRESUPUESTOS
 */
async function searchAll(search, user) {
  const base = `
    SELECT *
    FROM quotes
    WHERE (
      client_first_name ILIKE $1 OR
      client_last_name ILIKE $1 OR
      client_dni ILIKE $1 OR
      product ILIKE $1
    )
  `;

  if (user.role_id === 1) {
    const { rows } = await pool.query(
      `${base} ORDER BY created_at DESC`,
      [`%${search}%`]
    );
    return rows;
  }

  if (user.role_id === 2) {
    const { rows } = await pool.query(
      `
      ${base}
      AND (
        seller_id = $2
        OR seller_id IN (
          SELECT id FROM users WHERE supervisor_id = $2
        )
      )
      ORDER BY created_at DESC
      `,
      [`%${search}%`, user.id]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `
    ${base}
    AND seller_id = $2
    ORDER BY created_at DESC
    `,
    [`%${search}%`, user.id]
  );

  return rows;
}

/**
 * ACTUALIZAR ESTADO
 */
async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `
    UPDATE quotes
    SET status = $2
    WHERE id = $1
    RETURNING *
    `,
    [id, status]
  );

  return rows[0];
}

/**
 * APROBAR PRESUPUESTO
 */
async function approveWithPayment(id, { payment_method, final_amount }) {
  const { rows } = await pool.query(
    `
    UPDATE quotes
    SET
      status = 'APROBADO',
      payment_method = $2,
      total_amount = $3,
      resolved_at = CURRENT_DATE
    WHERE id = $1
    RETURNING *
    `,
    [id, payment_method, final_amount]
  );

  return rows[0];
}

/**
 * KPIs
 */
async function getDashboardKpisByUser(user) {
  if (user.role_id === 1) {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('APROBADO','CANCELADO')) AS leads_activos,
        COUNT(*) FILTER (WHERE status = 'ENVIADO') AS enviados,
        COUNT(*) FILTER (WHERE status = 'APROBADO') AS aprobados,
        COUNT(*) FILTER (WHERE status = 'CANCELADO') AS cancelados
      FROM quotes
    `);
    return rows[0];
  }

  if (user.role_id === 2) {
    const { rows } = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('APROBADO','CANCELADO')) AS leads_activos,
        COUNT(*) FILTER (WHERE status = 'ENVIADO') AS enviados,
        COUNT(*) FILTER (WHERE status = 'APROBADO') AS aprobados,
        COUNT(*) FILTER (WHERE status = 'CANCELADO') AS cancelados
      FROM quotes
      WHERE seller_id = $1
         OR seller_id IN (
           SELECT id FROM users WHERE supervisor_id = $1
         )
      `,
      [user.id]
    );
    return rows[0];
  }

  const { rows } = await pool.query(
    `
    SELECT
      COUNT(*) FILTER (WHERE status NOT IN ('APROBADO','CANCELADO')) AS leads_activos,
      COUNT(*) FILTER (WHERE status = 'ENVIADO') AS enviados,
      COUNT(*) FILTER (WHERE status = 'APROBADO') AS aprobados,
      COUNT(*) FILTER (WHERE status = 'CANCELADO') AS cancelados
    FROM quotes
    WHERE seller_id = $1
    `,
    [user.id]
  );

  return rows[0];
}

module.exports = {
  create,
  getById,
  send,
  list,
  searchAll,
  updateStatus,
  approveWithPayment,
  getDashboardKpisByUser
};