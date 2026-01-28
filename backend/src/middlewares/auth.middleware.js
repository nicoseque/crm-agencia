const jwt = require('jsonwebtoken');

function auth() {
  return (req, res, next) => {

    // ✅ PERMITIR PREFLIGHT CORS (SIN TOKEN)
    if (req.method === 'OPTIONS') {
      return next();
    }

    console.log('🔥 AUTH MIDDLEWARE EJECUTADO 🔥');

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
}

module.exports = auth;
