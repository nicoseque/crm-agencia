const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 🔴 CLAVE ABSOLUTA: forzar UTF-8
  client_encoding: 'UTF8'
});

pool.on('connect', async (client) => {
  console.log('🟢 PostgreSQL conectado (UTF-8)');

  // 🔒 Blindaje extra (Windows-safe)
  await client.query(`SET client_encoding = 'UTF8'`);
});

module.exports = pool;
