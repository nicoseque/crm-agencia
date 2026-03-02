const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth.middleware');

// 🔒 HEADERS ANTI CACHE
const noCache = (res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store'
  });
};

// 🔒 solo ADMIN y SUPERVISOR
const onlyAdminSupervisor = (req, res, next) => {
  if (![1, 2].includes(req.user.role_id)) {
    return res.status(403).json({ message: 'Sin permisos' });
  }
  next();
};

// 🆕 ADMIN + SUPERVISOR + VENDEDOR (solo lectura)
const adminSupervisorVendor = (req, res, next) => {
  if (![1, 2, 3].includes(req.user.role_id)) {
    return res.status(403).json({ message: 'Sin permisos' });
  }
  next();
};

/**
 * 📦 LISTAR PRODUCTOS
 */
router.get('/', auth(), adminSupervisorVendor, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM products
      ORDER BY created_at DESC
    `);

    noCache(res);
    res.json(result.rows);
  } catch (error) {
    console.error('ERROR products list:', error);
    res.status(500).json({ message: 'Error listando productos' });
  }
});

/**
 * ➕ CREAR PRODUCTO
 */
router.post('/', auth(), onlyAdminSupervisor, async (req, res) => {
  try {
    const { model, plan_type, vehicle_value, installments } = req.body;

    if (
      !model ||
      !plan_type ||
      vehicle_value == null ||
      installments == null
    ) {
      return res
        .status(400)
        .json({ message: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        model,
        plan_type,
        vehicle_value,
        installments
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [model, plan_type, vehicle_value, installments]
    );

    noCache(res);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('ERROR create product:', error);
    res.status(500).json({ message: 'Error creando producto' });
  }
});

/**
 * ✏️ EDITAR PRODUCTO
 */
router.put('/:id', auth(), onlyAdminSupervisor, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      model,
      plan_type,
      vehicle_value,
      installments,
      active
    } = req.body;

    const result = await pool.query(
      `
      UPDATE products
      SET
        model = $1,
        plan_type = $2,
        vehicle_value = $3,
        installments = $4,
        active = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [model, plan_type, vehicle_value, installments, active, id]
    );

    noCache(res);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('ERROR update product:', error);
    res.status(500).json({ message: 'Error actualizando producto' });
  }
});

module.exports = router;