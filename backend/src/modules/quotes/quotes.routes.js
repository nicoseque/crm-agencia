const express = require('express');
const router = express.Router();

const quotesController = require('./quotes.controller');
const auth = require('../../middlewares/auth.middleware');

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

module.exports = router;