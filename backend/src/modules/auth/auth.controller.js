const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usersService = require('../users/users.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersService.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (!user.active) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // 🔑 TOKEN NORMALIZADO
const token = jwt.sign(
  {
    id: user.id,
    role: user.role, // ← AHORA VIENE DEL JOIN CON ROLES
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

    return res.json({ token });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = {
  login,
};
