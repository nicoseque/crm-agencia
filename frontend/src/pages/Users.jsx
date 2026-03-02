import { useEffect, useState } from 'react';
import {
  getUsers,
  createUser,
  deactivateUser,
  activateUser,
  getAssignableUsers,
} from '../services/users.service';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // 🔥 LEEMOS TOKEN REAL
  const token = localStorage.getItem('token');
  const decoded = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const currentRole = decoded?.role;

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VENDEDOR',
    supervisor_id: '',
  });

  const loadUsers = () => {
    getUsers().then(setUsers);
  };

  const loadSupervisors = () => {
    getAssignableUsers().then((data) => {
      setSupervisors(data.filter((u) => u.role === 'SUPERVISOR'));
    });
  };

  useEffect(() => {
    loadUsers();
    loadSupervisors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.role === 'VENDEDOR' && !form.supervisor_id) {
      alert('Debés seleccionar un supervisor para el vendedor');
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      ...(form.role === 'VENDEDOR' && {
        supervisor_id: Number(form.supervisor_id),
      }),
    };

    try {
      await createUser(payload);

      setForm({
        name: '',
        email: '',
        password: '',
        role: 'VENDEDOR',
        supervisor_id: '',
      });

      setShowForm(false);
      loadUsers();

    } catch (error) {
      alert(error.message || 'Error al crear usuario');
    }
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

          {currentRole !== 'VENDEDOR' && (
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
          )}
        </div>

        {showForm && currentRole !== 'VENDEDOR' && (
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
                <label style={{ fontSize: 12, fontWeight: 600 }}>
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
              <label style={{ fontSize: 12, fontWeight: 600 }}>Rol</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                }}
              >
                <option value="VENDEDOR">Vendedor</option>

                {currentRole === 'ADMIN' && (
                  <>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador</option>
                  </>
                )}
              </select>
            </div>

            {form.role === 'VENDEDOR' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>
                  Supervisor
                </label>
                <select
                  name="supervisor_id"
                  value={form.supervisor_id}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                  }}
                >
                  <option value="">Seleccionar supervisor</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              }}
            >
              Crear usuario
            </button>
          </form>
        )}

        <table width="100%" cellPadding="14">
          <thead>
            <tr style={{ textAlign: 'left', color: '#6b7280' }}>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Supervisor asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td
                  style={{
                    fontWeight: 600,
                    color: u.active ? '#16a34a' : '#dc2626',
                  }}
                >
                  {u.active ? 'Activo' : 'Inactivo'}
                </td>
                <td>{u.supervisor_name || '—'}</td>
                <td>
                  {u.role === 'ADMIN' ? (
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>
                      Protegido
                    </span>
                  ) : u.active ? (
                    <button onClick={() => handleDeactivate(u)}>Eliminar</button>
                  ) : (
                    <button onClick={() => handleActivate(u)}>Activar</button>
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