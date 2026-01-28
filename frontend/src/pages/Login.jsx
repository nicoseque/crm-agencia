import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(email, password);

      /**
       * El backend DEBE devolver el token en una de estas formas.
       * Si no lo hace, el error es del backend.
       */
      const token =
        response?.token ||
        response?.accessToken ||
        response?.data?.token;

      if (!token) {
        throw new Error('El backend no devolvió un token');
      }

      // 🔐 Guardado estándar y definitivo
      localStorage.setItem('token', token);

      // Redirección al dashboard
      navigate('/');
    } catch (error) {
      alert(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '100px auto' }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <button style={{ width: '100%' }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default Login;
