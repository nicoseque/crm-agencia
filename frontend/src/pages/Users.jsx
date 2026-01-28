import { useEffect, useState } from 'react';
import {
  getUsers,
  createUser,
  deactivateUser,
  activateUser,
} from '../services/users.service';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VENDEDOR',
  });

  const loadUsers = () => {
    getUsers().then(setUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createUser(form).then(() => {
      setForm({ name: '', email: '', password: '', role: 'VENDEDOR' });
      setShowForm(false);
      loadUsers();
    });
  };

  const handleDeactivate = (user) => {
    if (user.role === 'ADMIN') return;

    if (window.confirm(`¿Desactivar al usuario "${user.name}"?`)) {
      deactivateUser(user.id).then(loadUsers);
    }
  };

  const handleActivate = (user) => {
    activateUser(user.id).then(loadUsers);
  };

  return (
    <div style={{ padding: 32, background: '#f3f4f6', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 40px rgba(0,0,0,.08)',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Usuarios</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
              Gestión de usuarios y permisos del sistema
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              color: showForm ? '#374151' : '#fff',
              background: showForm
                ? '#e5e7eb'
                : 'linear-gradient(135deg, #4f46e5, #6366f1)',
              boxShadow: showForm
                ? 'none'
                : '0 8px 24px rgba(79,70,229,.35)',
            }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo usuario'}
          </button>
        </div>

        {/* FORMULARIO */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              padding: 20,
              marginBottom: 32,
              borderRadius: 14,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
          >
            {[
              { label: 'Nombre', name: 'name', placeholder: 'Juan Pérez' },
              {
                label: 'Email',
                name: 'email',
                placeholder: 'usuario@crm.com',
                type: 'email',
              },
              {
                label: 'Contraseña',
                name: 'password',
                placeholder: '••••••••',
                type: 'password',
              },
            ].map((f) => (
              <div
                key={f.name}
                style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  {f.label}
                </label>
                <input
                  name={f.name}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                  }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                Rol
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  background: '#fff',
                }}
              >
                <option value="VENDEDOR">Vendedor</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                gridColumn: 'span 4',
                marginTop: 8,
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                fontWeight: 600,
                fontSize: 15,
                color: '#fff',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(34,197,94,.35)',
              }}
            >
              Crear usuario
            </button>
          </form>
        )}

        {/* TABLA */}
        <table width="100%" cellPadding="14">
          <thead>
            <tr style={{ textAlign: 'left', color: '#6b7280' }}>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        u.role === 'ADMIN'
                          ? '#fee2e2'
                          : u.role === 'SUPERVISOR'
                          ? '#fef3c7'
                          : '#e0f2fe',
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td
                  style={{
                    fontWeight: 600,
                    color: u.active ? '#16a34a' : '#dc2626',
                  }}
                >
                  {u.active ? 'Activo' : 'Inactivo'}
                </td>
                <td>
                  {u.role === 'ADMIN' ? (
                    <span
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        fontStyle: 'italic',
                      }}
                    >
                      Protegido
                    </span>
                  ) : u.active ? (
                    <button
                      onClick={() => handleDeactivate(u)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        background: '#dc2626',
                      }}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(u)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        background: '#16a34a',
                      }}
                    >
                      Activar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
