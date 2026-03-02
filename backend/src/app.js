const express = require('express');
const cors = require('cors');

console.log('🔥🔥🔥 ESTE ES EL BACKEND CORRECTO 🔥🔥🔥');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🔤 FORZAR UTF-8 EN TODAS LAS RESPUESTAS
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// RUTA DE SALUD
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM funcionando' });
});

// PING
app.get('/ping', (req, res) => {
  res.send('PONG');
});

// RUTAS
app.use('/auth', require('./modules/auth/auth.routes'));
app.use('/users', require('./modules/users/users.routes'));
app.use('/clients', require('./modules/clients/clients.routes'));
app.use('/quotes', require('./modules/quotes/quotes.routes'));
app.use('/metrics', require('./modules/metrics/metrics.routes'));
app.use('/pipeline', require('./routes/pipeline.routes'));
app.use('/pdf', require('./routes/pdf.routes'));
app.use('/audit', require('./audit/audit.routes'));
app.use('/metrics/commercial', require('./routes/commercial.routes'));
app.use('/products', require('./routes/products.routes'));


module.exports = app;
