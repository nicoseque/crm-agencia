const service = require('./users.service');
const { logAudit } = require('../../audit/audit.service');
const pool = require('../../config/db');

/**
 * CREAR USUARIO
 */
async function createUser(req, res) {
  try {

    // 🔎 Obtener rol real que se intenta crear
    const roleResult = await pool.query(
      'SELECT id, name FROM roles WHERE name = $1',
      [req.body.role]
    );

    if (roleResult.rowCount === 0) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const roleToCreate = roleResult.rows[0].name;

    // 🔒 REGLAS POR ROL

    // VENDEDOR no puede crear usuarios
    if (req.user.role === 'VENDEDOR') {
      return res.status(403).json({
        message: 'No tenés permisos para crear usuarios',
      });
    }

    // SUPERVISOR solo puede crear VENDEDOR
    if (
      req.user.role === 'SUPERVISOR' &&
      roleToCreate !== 'VENDEDOR'
    ) {
      return res.status(403).json({
        message: 'Un supervisor solo puede crear vendedores',
      });
    }

    const { supervisor_id } = req.body;

    // 🔥 si se crea un VENDEDOR, exigir supervisor
    if (roleToCreate === 'VENDEDOR' && !supervisor_id) {
      return res.status(400).json({
        message: 'Un usuario VENDEDOR debe tener un supervisor asignado',
      });
    }

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

/**
 * LISTAR USUARIOS
 */
async function listUsers(req, res) {
  console.log('🧪 USER EN USERS:', req.user);

  try {
    const users = await service.listUsers(req.user);
    res.json(users);
  } catch (error) {
    console.error('LIST USERS ERROR:', error);
    res.status(500).json({ message: 'Error listando usuarios' });
  }
}

// ✅ SOLO VENDEDORES (legacy / pipeline)
async function listVendors(req, res) {
  try {
    if (req.user.role === 'VENDEDOR') {
      const self = await service.getUserById(req.user.id);
      return res.json(self ? [self] : []);
    }

    const vendors = await service.listVendors();
    res.json(vendors);
  } catch (error) {
    console.error('LIST VENDORS ERROR:', error);
    res.status(500).json({ message: 'Error listando vendedores' });
  }
}

// 🆕 USUARIOS ASIGNABLES A PRESUPUESTOS
async function listAssignableUsers(req, res) {
  try {
    const users = await service.listAssignableUsers(req.user);
    res.json(users);
  } catch (error) {
    console.error('LIST ASSIGNABLE USERS ERROR:', error);
    res.status(500).json({ message: 'Error obteniendo usuarios asignables' });
  }
}

/**
 * ACTIVAR USUARIO
 */
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

/**
 * DESACTIVAR USUARIO
 */
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
  listAssignableUsers,
  activateUser,
  deactivateUser,
};