const express = require('express');
const router = express.Router();
const controller = require('./clients.controller');
const auth = require('../../middlewares/auth.middleware');

// Crear cliente → todos
router.post(
  '/',
  auth(),
  controller.createClient
);

// Listar clientes → todos (filtrado en service)
router.get(
  '/',
  auth(),
  controller.getClients
);

// Obtener cliente por DNI → todos
router.get(
  '/by-dni/:dni',
  auth(),
  controller.getClientByDni
);

// Obtener cliente por ID → todos
router.get(
  '/:id',
  auth(),
  controller.getClientById
);

// Actualizar cliente → todos
router.put(
  '/:id',
  auth(),
  controller.updateClient
);

// Desactivar cliente → todos
router.patch(
  '/:id/deactivate',
  auth(),
  controller.deactivateClient
);

module.exports = router;