import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Layout base de toda la app interna
 * Sidebar + contenido dinámico
 */
function DashboardLikeLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* CONTENIDO DINÁMICO */}
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLikeLayout;
