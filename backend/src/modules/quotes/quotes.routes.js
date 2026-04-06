const express = require('express');
const router = express.Router();

const quotesController = require('./quotes.controller');
const auth = require('../../middlewares/auth.middleware');
const pool = require('../../config/db');
const { generateQuotePdf } = require('../../services/pdf.service');


console.log('🟢 quotes.routes.js cargado');

// 🔎 PROBE – solo para prueba
router.patch('/__probe', (req, res) => {
  res.send('PATCH MODULE QUOTES OK');
});

// TEST
router.get('/test', (req, res) => {
  console.log('🟢 HIT /quotes/test');
  res.send('QUOTES TEST OK');
});

// CREAR PRESUPUESTO → todos
router.post(
  '/',
  auth(),
  quotesController.create
);

// LISTAR PRESUPUESTOS → todos (filtrado en service)
router.get(
  '/',
  auth(),
  quotesController.list
);

// CAMBIAR ESTADO (drag & drop) → todos
router.patch(
  '/:id/status',
  auth(),
  quotesController.updateStatus
);

// APROBAR PRESUPUESTO → todos
router.post(
  '/:id/approve',
  auth(),
  quotesController.approveWithPayment
);

// GENERAR PDF → todos
router.get(
  '/:id/pdf',
  auth(),
  quotesController.generateQuotePdf
);

// ENVIAR PRESUPUESTO → todos
router.post(
  '/:id/send',
  auth(),
  quotesController.send
);

router.get(
  '/kpis',
  auth(),
  quotesController.getDashboardKpis
);

// 🔓 PDF PUBLICO (SIN TOKEN)
router.get('/public/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT *
      FROM quotes
      WHERE id = $1
    `, [id]);

    const quote = result.rows[0];

    if (!quote) {
      return res.status(404).send('No encontrado');
    }

    const pdfBuffer = await generateQuotePdf(quote);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="presupuesto_${quote.id}.pdf"`
    );

    res.end(pdfBuffer);

  } 
  
  catch (err) {
  console.error("🔥 ERROR REAL PDF:", err);
  res.status(500).send(err.message);
}
});

module.exports = router;