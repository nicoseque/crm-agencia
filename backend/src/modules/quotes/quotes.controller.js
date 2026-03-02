const service = require('./quotes.service');
const { generateQuotePdf } = require('../../services/pdf.service');

/**
 * CREAR PRESUPUESTO
 */
async function create(req, res) {
  try {
    const quote = await service.create({
      ...req.body,
      seller_id: req.user.id // 🔥 ownership correcto
    });

    res.status(201).json(quote);
  } catch (err) {
    console.error('❌ CONTROLLER CREATE ERROR:', err);
    res.status(400).json({ message: err.message });
  }
}

/**
 * ENVIAR PRESUPUESTO
 */
async function send(req, res) {
  try {
    const quotes = await service.list(req.user);
    const allowed = quotes.some(q => q.id === Number(req.params.id));

    if (!allowed) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    await service.send(req.params.id, req.user.id);
    res.json({ message: 'Presupuesto enviado' });
  } catch (err) {
    console.error('❌ send error:', err);
    res.status(400).json({ message: err.message });
  }
}

/**
 * LISTAR PRESUPUESTOS
 */
async function list(req, res) {
  try {
    const { search } = req.query;

    if (search && search.trim() !== '') {
      // 🔒 search también respeta visibilidad
      const quotes = await service.list(req.user);
      const filtered = quotes.filter(q =>
        q.client_first_name?.toLowerCase().includes(search.toLowerCase()) ||
        q.client_last_name?.toLowerCase().includes(search.toLowerCase()) ||
        q.client_dni?.includes(search) ||
        q.product?.toLowerCase().includes(search.toLowerCase())
      );
      return res.json(filtered);
    }

    const quotes = await service.list(req.user);
    res.json(quotes);
  } catch (err) {
    console.error('❌ CONTROLLER LIST ERROR:', err);
    res.status(500).json({ message: 'Error listando presupuestos' });
  }
}

/**
 * ACTUALIZAR STATUS
 */
async function updateStatus(req, res) {
  try {
    const quotes = await service.list(req.user);
    const allowed = quotes.some(q => q.id === Number(req.params.id));

    if (!allowed) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { status } = req.body;
    await service.updateStatus(req.params.id, status);

    res.json({ ok: true });
  } catch (err) {
    console.error('❌ updateStatus error:', err);
    res.status(400).json({ message: err.message });
  }
}

/**
 * APROBAR CON COBRO REAL
 */
async function approveWithPayment(req, res) {
  try {
    const quotes = await service.list(req.user);
    const allowed = quotes.some(q => q.id === Number(req.params.id));

    if (!allowed) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { payment_method, final_amount } = req.body;

    const quote = await service.approveWithPayment(req.params.id, {
      payment_method,
      final_amount
    });

    res.json(quote);
  } catch (err) {
    console.error('❌ approveWithPayment error:', err);
    res.status(400).json({ message: err.message });
  }
}

/**
 * GENERAR PDF
 */
async function generateQuotePdfController(req, res) {
  try {
    const quotes = await service.list(req.user);
    const quote = quotes.find(q => q.id === Number(req.params.id));

    if (!quote) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const pdfBuffer = await generateQuotePdf(quote);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="presupuesto_${quote.id}.pdf"`
    );

    res.end(pdfBuffer);
  } catch (err) {
    console.error('❌ Error PDF:', err);
    res.status(500).send('Error generando PDF');
  }
}

async function getDashboardKpis(req, res) {
  try {
    const kpis = await service.getDashboardKpisByUser(req.user);
    res.json(kpis);
  } catch (err) {
    console.error('❌ KPIs error:', err);
    res.status(500).json({ message: 'Error obteniendo KPIs' });
  }
}
module.exports = {
  create,
  send,
  list,
  updateStatus,
  approveWithPayment,
  getDashboardKpis,
  generateQuotePdf: generateQuotePdfController
};