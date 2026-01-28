const service = require('./users.service');
const { logAudit } = require('../../audit/audit.service');

async function createUser(req, res) {
  try {
    const user = await service.createUser(req.body);

    try {
      await logAudit({
        action: 'CREATE_USER',
        targetUserId: user.id,
        performedBy: req.user.id,
      });
    } catch (auditError) {
      console.error('AUDIT ERROR (CREATE_USER):', auditError);
    }

    res.status(201).json(user);
  } catch (err) {
    console.error('CREATE USER ERROR:', err);
    res.status(400).json({ message: err.message });
  }
}

async function listUsers(req, res) {
  const users = await service.listUsers();
  res.json(users);
}

// ✅ SOLO VENDEDORES (legacy / pipeline)
async function listVendors(req, res) {
  const vendors = await service.listVendors();
  res.json(vendors);
}

// 🆕 USUARIOS ASIGNABLES A PRESUPUESTOS
// VENDEDOR + SUPERVISOR (ADMIN EXCLUIDO)
async function listAssignableUsers(req, res) {
  try {
    const users = await service.listAssignableUsers();
    res.json(users);
  } catch (error) {
    console.error('LIST ASSIGNABLE USERS ERROR:', error);
    res.status(500).json({ message: 'Error obteniendo usuarios asignables' });
  }
}

async function activateUser(req, res) {
  try {
    await service.setActive(req.params.id, true);

    try {
      await logAudit({
        action: 'ACTIVATE_USER',
        targetUserId: req.params.id,
        performedBy: req.user.id,
      });
    } catch (auditError) {
      console.error('AUDIT ERROR (ACTIVATE_USER):', auditError);
    }

    res.json({ message: 'Usuario activado' });
  } catch (error) {
    console.error('ACTIVATE USER ERROR:', error);
    res.status(500).json({ message: 'Error activando usuario' });
  }
}

async function deactivateUser(req, res) {
  try {
    await service.setActive(req.params.id, false);

    try {
      await logAudit({
        action: 'DEACTIVATE_USER',
        targetUserId: req.params.id,
        performedBy: req.user.id,
      });
    } catch (auditError) {
      console.error('AUDIT ERROR (DEACTIVATE_USER):', auditError);
    }

    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    console.error('DEACTIVATE USER ERROR:', error);
    res.status(500).json({ message: 'Error desactivando usuario' });
  }
}

module.exports = {
  createUser,
  listUsers,
  listVendors,
  listAssignableUsers, // 👈 NUEVO
  activateUser,
  deactivateUser,
};
