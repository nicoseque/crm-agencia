require('dotenv').config(); // 👈 ESTA LÍNEA ES LA CLAVE

console.log('🔥 ESTE SERVER ES EL CORRECTO 🔥');

const app = require('./app');

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});
