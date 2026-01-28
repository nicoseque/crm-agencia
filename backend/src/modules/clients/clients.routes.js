const express = require('express');
const router = express.Router();
const controller = require('./clients.controller');
const auth = require('../../middlewares/auth.middleware');

// Crear cliente → ADMIN / SUPERVISOR / VENDEDOR
router.post('/', auth([1, 2, 3]), controller.createClient);

// Listar clientes → todos
router.get('/', auth([1, 2, 3]), controller.getClients);

// 🆕 Obtener cliente por DNI → todos
router.get('/by-dni/:dni', auth([1, 2, 3]), controller.getClientByDni);

// Obtener cliente por ID → todos
router.get('/:id', auth([1, 2, 3]), controller.getClientById);

router.put('/:id', auth([1, 2, 3]), controller.updateClient);
router.patch('/:id/deactivate', auth([1, 2, 3]), controller.deactivateClient);

module.exports = router;
