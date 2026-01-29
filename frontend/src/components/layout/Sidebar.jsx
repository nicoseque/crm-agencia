import { NavLink } from 'react-router-dom';

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // 🔐 obtener rol desde el token
  const token = localStorage.getItem('token');
  let role = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
    } catch (e) {
      role = null;
    }
  }

  // 👑 roles con acceso completo
  const canSeeAdminSections =
    role === 'ADMIN' || role === 'SUPERVISOR';

  const linkStyle = ({ isActive }) => ({
    padding: '10px 14px',
    borderRadius: 10,
    marginBottom: 6,
    display: 'block',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    color: isActive ? '#111827' : '#374151',
    background: isActive ? '#f3f4f6' : 'transparent',
    transition: 'all .15s ease'
  });

  return (
    <aside
      style={{
        width: 240,
        height: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: 20,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* LOGO */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo-age.png"
            alt="AGE Automobile"
            style={{ width: 34, height: 34 }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              AGE Automobile
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              CRM v1.0
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav style={{ flex: 1 }}>
        <NavLink to="/" style={linkStyle}>
          Inicio
        </NavLink>

        <NavLink to="/clients" style={linkStyle}>
          Clientes
        </NavLink>

        <NavLink to="/ranking" style={linkStyle}>
          Ranking de Vendedores
        </NavLink>

        {/* 🔒 SOLO ADMIN / SUPERVISOR */}
        {canSeeAdminSections && (
          <>
            <NavLink to="/sales-history" style={linkStyle}>
              Histórico de Ventas
            </NavLink>

            <NavLink to="/gestion-comercial" style={linkStyle}>
              Gestión Comercial
            </NavLink>

            <NavLink to="/users" style={linkStyle}>
              Usuarios
            </NavLink>

            <NavLink to="/audit/users" style={linkStyle}>
              Auditoría
            </NavLink>
          </>
        )}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: 16,
          padding: '10px 14px',
          borderRadius: 10,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          color: '#374151',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Logout
      </button>

      <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af' }}>
        © ByV Tech SRL
      </div>
    </aside>
  );
}

export default Sidebar;
