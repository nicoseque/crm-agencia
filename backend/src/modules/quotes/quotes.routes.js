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

// TEST CREATE (opcional)
router.post('/test-create', (req, res) => {
  res.json({ ok: true });
});

// CREAR PRESUPUESTO
router.post('/', auth(), quotesController.create);

// LISTAR PRESUPUESTOS
router.get('/', auth(), quotesController.list);

// ✅ ACTUALIZAR STATUS (DRAG & DROP)
router.patch('/:id/status', auth(), quotesController.updateStatus);

// GENERAR PDF
router.get('/:id/pdf', quotesController.generateQuotePdf);

// ENVIAR PRESUPUESTO
router.post('/:id/send', auth(), quotesController.send);

module.exports = router;
