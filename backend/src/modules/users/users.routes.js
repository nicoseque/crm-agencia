const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const auth = require('../../middlewares/auth.middleware');
const { allowRoles } = require('../../middlewares/role.middleware');

// CREAR USUARIO → solo ADMIN
router.post(
  '/',
  auth(),
  allowRoles('ADMIN', 'SUPERVISOR'),
  controller.createUser
);

// LISTAR USUARIOS → ADMIN y SUPERVISOR
router.get(
  '/',
  auth(),
  allowRoles('ADMIN', 'SUPERVISOR', 'VENDEDOR'),
  controller.listUsers
);

// ✅ listar solo vendedores (legacy / pipeline)
router.get(
  '/vendors',
  auth(),
  allowRoles('ADMIN', 'SUPERVISOR', 'VENDEDOR'), // 👈 agregado
  controller.listVendors
);

// 🆕 usuarios asignables a presupuestos
router.get(
  '/assignable',
  auth(),
  allowRoles('ADMIN', 'SUPERVISOR', 'VENDEDOR'),
  controller.listAssignableUsers
);

// ACTIVAR USUARIO → solo ADMIN
router.patch(
  '/:id/activate',
  auth(),
  allowRoles('ADMIN'),
  controller.activateUser
);

// DESACTIVAR USUARIO → solo ADMIN
router.patch(
  '/:id/deactivate',
  auth(),
  allowRoles('ADMIN'),
  controller.deactivateUser
);

module.exports = router;