const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth.middleware');

/**
 * 🔒 NO CACHE
 */
const noCache = (res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store'
  });
};

/**
 * 📊 GESTIÓN COMERCIAL – RESUMEN POR VENDEDOR
 * ✔ Mes actual por defecto
 * ✔ Mes histórico vía ?month=YYYY-MM
 */
router.get('/vendors', auth(), async (req, res) => {
  try {
    const { month } = req.query; // '2026-01' | undefined

    const result = await pool.query(
      `
      WITH monthly_quotes AS (
        SELECT
          q.seller_id,
          COUNT(*)::int AS total_quotes,

          COUNT(*) FILTER (WHERE q.status = 'APROBADO')::int
            AS approved_quotes,

          COUNT(*) FILTER (
            WHERE q.status IN ('BORRADOR', 'ENVIADO')
              AND q.created_at <= NOW() - INTERVAL '3 days'
          )::int AS stale_quotes,

          COALESCE(
            SUM(q.total_amount)
              FILTER (WHERE q.status = 'APROBADO'),
            0
          )::numeric AS total_amount

        FROM quotes q
        WHERE date_trunc(
                'month',
                q.created_at
              ) = date_trunc(
                'month',
                COALESCE($1::date, CURRENT_DATE)
              )
        GROUP BY q.seller_id
      )

      SELECT
        u.id AS seller_id,
        u.name AS seller_name,
        u.monthly_target,              -- ✅ FIX CLAVE (NO EXISTÍA)

        m.total_quotes,
        m.approved_quotes,

        CASE
          WHEN m.total_quotes > 0 THEN
            ROUND(
              (m.approved_quotes::numeric / m.total_quotes) * 100
            )
          ELSE 0
        END AS effectiveness,

        m.stale_quotes,
        m.total_amount,

        CASE
          WHEN m.stale_quotes >= 4 THEN 'RED'
          WHEN (
            CASE
              WHEN m.total_quotes > 0 THEN
                (m.approved_quotes::numeric / m.total_quotes) * 100
              ELSE 0
            END
          ) < 30 THEN 'YELLOW'
          ELSE 'GREEN'
        END AS status

      FROM monthly_quotes m
      JOIN users u ON u.id = m.seller_id
      ORDER BY status, m.total_amount DESC;
      `,
      [month ? `${month}-01` : null]
    );

    noCache(res);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR commercial vendors:', error);
    res.status(500).json({ message: 'Error gestión comercial' });
  }
});

/**
 * ⏰ PRESUPUESTOS VENCIDOS POR VENDEDOR (DETALLE)
 * (NO depende del mes seleccionado)
 */
router.get(
  '/vendors/:sellerId/stale-quotes',
  auth(),
  async (req, res) => {
    try {
      const { sellerId } = req.params;

      const result = await pool.query(
        `
        SELECT
          q.id,
          q.client_name,
          q.total_amount,
          q.status,
          q.created_at,
          DATE_PART(
            'day',
            NOW() - q.created_at
          )::int AS days_stale
        FROM quotes q
        WHERE q.seller_id = $1
          AND q.status IN ('BORRADOR', 'ENVIADO')
          AND q.created_at <= NOW() - INTERVAL '3 days'
        ORDER BY q.created_at ASC
        `,
        [sellerId]
      );

      noCache(res);
      res.json(result.rows);
    } catch (error) {
      console.error('❌ ERROR stale quotes:', error);
      res.status(500).json({ message: 'Error obteniendo vencidos' });
    }
  }
);

module.exports = router;