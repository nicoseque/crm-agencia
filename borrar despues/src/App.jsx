import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta principal */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
