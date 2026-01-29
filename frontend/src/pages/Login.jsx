import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      const token =
        response?.token ||
        response?.accessToken ||
        response?.data?.token;

      if (!token) throw new Error('Credenciales inválidas');

      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError('Email o contraseña incorrectos');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={overlay} />

      <div
        style={{
          ...card,
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? shake
              ? 'translateX(-14px)'
              : 'translateY(0) scale(1)'
            : 'translateY(140px) scale(0.85)',
          animation: shake ? 'shake 0.5s' : 'none',
          transition: 'opacity 3s ease-out, transform 3s ease-out'
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Iniciar sesión</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={input}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={input}
            />
          </div>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>

      {/* KEYFRAMES */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-14px); }
            40% { transform: translateX(14px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}

export default Login;

/* =====================
   🎨 ESTILOS
   ===================== */

const page = {
  minHeight: '100vh',
  backgroundImage: "url('/login.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const overlay = {
  position: 'absolute',
  inset: 0,
  background: `
    linear-gradient(
      to bottom,
      rgba(0,0,0,0.25),
      rgba(0,0,0,0.45),
      rgba(0,0,0,0.65)
    )
  `,
  backdropFilter: 'blur(1px)'
};

const card = {
  position: 'relative',
  zIndex: 1,
  width: 340,
  padding: 32,
  borderRadius: 16,
  background: 'rgba(255,255,255,0.96)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
};

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14
};

const button = {
  width: '100%',
  padding: '12px',
  marginTop: 10,
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700
};

const errorStyle = {
  marginBottom: 12,
  fontSize: 13,
  fontWeight: 600,
  color: '#dc2626'
};
