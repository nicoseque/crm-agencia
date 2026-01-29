const service = require('./quotes.service');
const { generateQuotePdf } = require('../../services/pdf.service');

/**
 * CREAR PRESUPUESTO
 */
async function create(req, res) {
  try {
    console.log('BODY CREATE QUOTE:', req.body);

    const {
      seller_id,
      client_dni,
      client_first_name,
      client_last_name,
      interest_type,
      product,
      description,
      total_amount,
      currency,

      // 🔽 NUEVOS CAMPOS
      payment_method,
      card_number,
      card_expiry,
      card_cvv,
      save_card
    } = req.body;

    const quote = await service.create(req.user.id, {
      seller_id,
      client_dni,
      client_first_name,
      client_last_name,
      interest_type,
      product,
      description,
      total_amount,
      currency,

      payment_method,
      card_number,
      card_expiry,
      card_cvv,
      save_card
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
    await service.send(req.params.id, req.user.id);
    res.json({ message: 'Presupuesto enviado' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/**
 * LISTAR PRESUPUESTOS
 */
async function list(req, res) {
  try {
    const quotes = await service.list(req.user);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Error listando presupuestos' });
  }
}

/**
 * ACTUALIZAR STATUS
 */
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const quoteId = req.params.id;

    await service.updateStatus(quoteId, status);

    res.json({ ok: true });
  } catch (err) {
    console.error('❌ updateStatus error:', err);
    res.status(400).json({ message: err.message });
  }
}

/**
 * GENERAR PDF
 */
async function generateQuotePdfController(req, res) {
  try {
    const quoteId = req.params.id;
    const quote = await service.getById(quoteId);

    const pdfBuffer = await generateQuotePdf(quote);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="presupuesto_${quote.id}.pdf"`
    );

    return res.end(pdfBuffer);
  } catch (err) {
    console.error('❌ Error PDF:', err);
    res.status(500).send('Error generando PDF');
  }
}

module.exports = {
  create,
  send,
  list,
  updateStatus,
  generateQuotePdf: generateQuotePdfController
};
