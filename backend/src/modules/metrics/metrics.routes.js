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
 * 📊 KPIs SUPERIORES DEL DASHBOARD (PRO)
 */
router.get('/kpis', auth(), async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    // 🔑 filtro por rol (MISMO criterio que pipeline)
    const whereSeller =
      role === 'VENDEDOR' ? 'AND seller_id = $1' : '';

    const params = role === 'VENDEDOR' ? [userId] : [];

    const [
      leadsActivosRes,
      enviadosRes,
      aprobadosRes,
      canceladosRes,
      montoAprobadoRes,
      montoEnJuegoRes,
      ventasMesActualRes,
      ventasMesAnteriorRes,
      ticketPromedioRes
    ] = await Promise.all([
      pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM quotes
        WHERE status IN ('BORRADOR', 'ENVIADO')
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM quotes
        WHERE status = 'ENVIADO'
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM quotes
        WHERE status = 'APROBADO'
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM quotes
        WHERE status = 'CANCELADO'
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
        FROM quotes
        WHERE status = 'APROBADO'
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
        FROM quotes
        WHERE status IN ('BORRADOR', 'ENVIADO')
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
        FROM quotes
        WHERE status = 'APROBADO'
          AND date_trunc('month', resolved_at) = date_trunc('month', CURRENT_DATE)
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
        FROM quotes
        WHERE status = 'APROBADO'
          AND date_trunc('month', resolved_at)
              = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        ${whereSeller}
        `,
        params
      ),

      pool.query(
        `
        SELECT
          CASE
            WHEN COUNT(*) > 0 THEN
              ROUND(SUM(total_amount) / COUNT(*))
            ELSE 0
          END::numeric AS total
        FROM quotes
        WHERE status = 'APROBADO'
        ${whereSeller}
        `,
        params
      )
    ]);

    const ventasMesActual = Number(ventasMesActualRes.rows[0].total);
    const ventasMesAnterior = Number(ventasMesAnteriorRes.rows[0].total);

    const variacionMes =
      ventasMesAnterior > 0
        ? Math.round(
            ((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100
          )
        : 0;

    noCache(res);

    res.json({
      leads_activos: leadsActivosRes.rows[0].total,
      enviados: enviadosRes.rows[0].total,
      aprobados: aprobadosRes.rows[0].total,
      cancelados: canceladosRes.rows[0].total,

      monto_aprobado: montoAprobadoRes.rows[0].total,
      monto_en_juego: montoEnJuegoRes.rows[0].total,

      ventas_mes_actual: ventasMesActual,
      ventas_mes_anterior: ventasMesAnterior,
      variacion_mes: variacionMes,
      ticket_promedio: ticketPromedioRes.rows[0].total
    });
  } catch (error) {
    console.error('❌ ERROR KPIs:', error);
    res.status(500).json({ message: 'Error obteniendo KPIs' });
  }
});

/**
 * 🏆 RANKING DE VENDEDORES
 */
router.get('/sales-by-seller', auth(), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id AS seller_id,
        u.name AS seller_name,

        COUNT(q.id)::int AS total_quotes,

        COUNT(q.id)
          FILTER (WHERE q.status = 'APROBADO')::int
          AS approved_quotes,

        CASE
          WHEN COUNT(q.id) > 0 THEN
            ROUND(
              (
                COUNT(q.id)
                  FILTER (WHERE q.status = 'APROBADO')::numeric
                / COUNT(q.id)
              ) * 100
            )
          ELSE 0
        END AS effectiveness,

        COALESCE(
          SUM(q.total_amount)
            FILTER (WHERE q.status = 'APROBADO'),
          0
        )::numeric AS total_amount

      FROM quotes q
      JOIN users u ON u.id = q.seller_id
      GROUP BY u.id, u.name
      ORDER BY total_amount DESC
    `);

    noCache(res);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR sales-by-seller:', error);
    res.status(500).json({ message: 'Error obteniendo ranking' });
  }
});

/**
 * 📈 VENTAS POR MES
 */
router.get('/sales-by-month', auth(), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(
          date_trunc('month', resolved_at::date),
          'YYYY-MM'
        ) AS month,
        COALESCE(SUM(total_amount), 0)::numeric AS total
      FROM quotes
      WHERE status = 'APROBADO'
        AND resolved_at IS NOT NULL
      GROUP BY month
      ORDER BY month
    `);

    noCache(res);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR sales-by-month:', error);
    res.status(500).json({ message: 'Error ventas por mes' });
  }
});

module.exports = router;
