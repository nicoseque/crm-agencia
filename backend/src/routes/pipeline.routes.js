const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth.middleware');

router.get(
  '/',
  auth(['ADMIN', 'SUPERVISOR', 'VENDEDOR']),
  async (req, res) => {
    try {
      const { id: userId, role } = req.user;

      let query = `
        SELECT
          q.id,
          q.status,
          q.total_amount,
          q.created_at,
          q.resolved_at,
          q.client_first_name,
          q.client_last_name,
          q.company_name,
          q.company_logo_url,
          q.seller_id,
          u.name AS seller_name
        FROM quotes q
        LEFT JOIN users u ON u.id = q.seller_id
      `;

      const params = [];

      if (role === 'VENDEDOR') {
        query += ' WHERE q.seller_id = $1';
        params.push(userId);
      }

      query += ' ORDER BY q.created_at ASC';

      const result = await pool.query(query, params);

const columns = {
  BORRADOR: { id: 1, name: 'Nuevos Leads', status: 'BORRADOR', leads: [] },
  ENVIADO: { id: 2, name: 'Presupuestos Enviados', status: 'ENVIADO', leads: [] },
  APROBADO: { id: 3, name: 'Aprobados', status: 'APROBADO', leads: [] },
  CANCELADO: { id: 4, name: 'Cancelados', status: 'CANCELADO', leads: [] }
};

      let company = null;

      result.rows.forEach(row => {
        if (!company && row.company_name) {
          company = {
            name: row.company_name,
            logo_url: row.company_logo_url
          };
        }

        const column = columns[row.status];
        if (!column) return;

        column.leads.push({
          id: row.id,
          status: row.status,
          created_at: row.created_at,
          resolved_at: row.resolved_at,
          client_name: row.client_first_name
            ? `${row.client_first_name} ${row.client_last_name || ''}`.trim()
            : 'Sin nombre',
          seller_name: row.seller_name || 'Sin vendedor',
          amount: row.total_amount
        });
      });

      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.status(200).json({
        company,
        columns: Object.values(columns)
      });
    } catch (error) {
      console.error('PIPELINE ERROR:', error);
      res.status(500).json({ message: 'Error obteniendo pipeline' });
    }
  }
);

module.exports = router;
