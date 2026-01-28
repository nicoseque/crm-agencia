import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post('http://localhost:3001/auth/login', {
        email,
        password
      })

      localStorage.setItem('token', res.data.token)

      // 👉 ACÁ SE HACE EL PASO 3 REAL
      navigate('/dashboard')

    } catch (err) {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  )
}

export default Login
