const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth.middleware');
const { generateQuotePdf } = require('../services/pdf.service');

router.get('/quote/:id', auth(), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT * FROM quotes WHERE id = $1',
    [id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ message: 'Presupuesto no encontrado' });
  }

  const pdf = await generateQuotePdf(result.rows[0]);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=presupuesto-${id}.pdf`
  });

  res.send(pdf);
});

module.exports = router;
