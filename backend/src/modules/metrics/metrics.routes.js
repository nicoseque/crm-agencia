const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const auth = require('../../middlewares/auth.middleware');

// 🔒 HEADERS ANTI CACHE
const noCache = (res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
};

/**
 * 📊 KPIs DEL DASHBOARD (SOLO MES ACTUAL)
 */
router.get('/kpis', auth(), async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let scopeWhere = '';
    let params = [];

    // VENDEDOR
    if (role === 'VENDEDOR') {
      scopeWhere = 'AND seller_id = $1';
      params = [userId];
    }

    // SUPERVISOR (🔥 CORREGIDO)
    if (role === 'SUPERVISOR') {
      scopeWhere = `
        AND seller_id IN (
          SELECT id FROM users WHERE supervisor_id = $1
        )
      `;
      params = [userId];
    }

    const [
      creados,
      activos,
      enviados,
      aprobados,
      cancelados,
      aprobadosMesAnterior
    ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int total
        FROM quotes
        WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
        ${scopeWhere}
      `, params),

      pool.query(`
        SELECT COUNT(*)::int total
        FROM quotes
        WHERE status IN ('BORRADOR','ENVIADO')
        AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
        ${scopeWhere}
      `, params),

      pool.query(`
        SELECT COUNT(*)::int total
        FROM quotes
        WHERE status = 'ENVIADO'
        AND date_trunc('month', sent_at) = date_trunc('month', CURRENT_DATE)
        ${scopeWhere}
      `, params),

      pool.query(`
        SELECT COUNT(*)::int total
        FROM quotes
        WHERE status = 'APROBADO'
        AND date_trunc('month', resolved_at) = date_trunc('month', CURRENT_DATE)
        ${scopeWhere}
      `, params),

      pool.query(`
        SELECT COUNT(*)::int total
        FROM quotes
        WHERE status = 'CANCELADO'
        AND date_trunc('month', resolved_at) = date_trunc('month', CURRENT_DATE)
        ${scopeWhere}
      `, params),

      pool.query(`
        SELECT COUNT(*)::int total
        FROM quotes
        WHERE status = 'APROBADO'
        AND date_trunc('month', resolved_at) =
            date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        ${scopeWhere}
      `, params)
    ]);

    const creadosMes = creados.rows[0].total;
    const aprobadosMes = aprobados.rows[0].total;
    const aprobadosAnterior = aprobadosMesAnterior.rows[0].total;

    const tasaAprobacion =
      creadosMes > 0
        ? Math.round((aprobadosMes / creadosMes) * 100)
        : 0;

    const variacionMes =
      aprobadosAnterior > 0
        ? Math.round(((aprobadosMes - aprobadosAnterior) / aprobadosAnterior) * 100)
        : 0;

    noCache(res);

    res.json({
      leads_activos: activos.rows[0].total,
      enviados: enviados.rows[0].total,
      aprobados: aprobadosMes,
      cancelados: cancelados.rows[0].total,
      tasa_aprobacion: tasaAprobacion,
      ventas_mes_actual: aprobadosMes,
      ventas_mes_anterior: aprobadosAnterior,
      variacion_mes: variacionMes,
      monto_aprobado: null,
      monto_en_juego: null,
      ticket_promedio: null
    });
  } catch (err) {
    console.error('❌ KPIS ERROR:', err);
    res.status(500).json({ message: 'Error KPIs' });
  }
});

/**
 * 🏆 RANKING DE VENDEDORES
 */
router.get('/sales-by-seller', auth(), async (req, res) => {
  const { month } = req.query;
  const params = [];
  let filter = '';

  if (month) {
    filter = `
      AND date_trunc('month', COALESCE(q.resolved_at,q.created_at))
          = date_trunc('month', $1::date)
    `;
    params.push(`${month}-01`);
  }

  const result = await pool.query(`
    SELECT
      u.id seller_id,
      u.name seller_name,
      COUNT(q.id)::int generated_quotes,
      COUNT(q.id) FILTER (WHERE q.status='APROBADO')::int approved_quotes,
      CASE
        WHEN COUNT(q.id) > 0 THEN
          ROUND(
            (COUNT(q.id) FILTER (WHERE q.status='APROBADO')::numeric
            / COUNT(q.id)) * 100
          )
        ELSE 0
      END effectiveness
    FROM quotes q
    JOIN users u ON u.id = q.seller_id
    WHERE 1=1 ${filter}
    GROUP BY u.id,u.name
    ORDER BY approved_quotes DESC
  `, params);

  res.json({ month: month || null, data: result.rows });
});

/**
 * 📈 PLANES APROBADOS POR MES (HISTÓRICO)
 */
router.get('/sales-by-month', auth(), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        month_label,
        total,
        CASE
          WHEN prev_total IS NULL OR prev_total = 0 THEN NULL
          ELSE ROUND(((total - prev_total) / prev_total) * 100)
        END AS variation_percent
      FROM (
        SELECT
          TO_CHAR(
            date_trunc('month', COALESCE(resolved_at, created_at)),
            'YYYY-MM'
          ) AS month_label,
          COUNT(*)::int AS total,
          LAG(COUNT(*)) OVER (
            ORDER BY date_trunc('month', COALESCE(resolved_at, created_at))
          ) AS prev_total
        FROM quotes
        WHERE status = 'APROBADO'
          AND COALESCE(resolved_at, created_at)
              >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY date_trunc('month', COALESCE(resolved_at, created_at))
      ) t
      ORDER BY month_label DESC;
    `);

    noCache(res);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR sales-by-month:', error);
    res.status(500).json({ message: 'Error ventas por mes' });
  }
});

/**
 * 🏆 TOP PRODUCTOS
 */
router.get('/top-products', auth(), async (req, res) => {
  const { month } = req.query;
  const params = [];
  let filter = '';

  if (month) {
    filter = `
      AND date_trunc('month', resolved_at) = date_trunc('month', $1::date)
    `;
    params.push(`${month}-01`);
  } else {
    filter = `
      AND date_trunc('month', resolved_at) = date_trunc('month', CURRENT_DATE)
    `;
  }

  const result = await pool.query(`
    SELECT product, COUNT(*)::int total_aprobados
    FROM quotes
    WHERE status='APROBADO'
    AND resolved_at IS NOT NULL
    ${filter}
    GROUP BY product
    ORDER BY total_aprobados DESC
    LIMIT 3
  `, params);

  noCache(res);
  res.json(result.rows);
});

module.exports = router;