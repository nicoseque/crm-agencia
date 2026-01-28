const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', auth(['ADMIN']), controller.createUser);
router.get('/', auth(['ADMIN']), controller.listUsers);

// ✅ listar solo vendedores (legacy / pipeline)
router.get('/vendors', auth(['ADMIN', 'SUPERVISOR']), controller.listVendors);

// 🆕 usuarios asignables a presupuestos
router.get('/assignable', auth(['ADMIN', 'SUPERVISOR']), controller.listAssignableUsers);

router.patch('/:id/activate', auth(['ADMIN']), controller.activateUser);
router.patch('/:id/deactivate', auth(['ADMIN']), controller.deactivateUser);

module.exports = router;
