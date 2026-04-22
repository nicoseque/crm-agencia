import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Layout base de toda la app interna
 * Sidebar + Header + contenido dinámico
 */
function DashboardLikeLayout() {
  // 👉 Obtener usuario del localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* CONTENIDO DERECHO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* 🔥 HEADER SUPERIOR */}
        <header
          style={{
            width: '100%',
            background: '#111827',
            color: '#fff',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            CRM Agencia
          </div>

          <div>
            {user ? `👤 ${user.name || user.email}` : 'No logueado'}
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLikeLayout;