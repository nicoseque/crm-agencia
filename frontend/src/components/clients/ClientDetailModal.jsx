import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

function ClientDetailModal({ open, clientId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    dni: '',
    name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    birth_date: '',
    notes: ''
  });

  useEffect(() => {
    if (!open || !clientId) return;

    const loadClient = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/clients/${clientId}`);
        setForm({
          dni: data.dni || '',
          name: data.name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          birth_date: data.birth_date || '',
          notes: data.notes || ''
        });
      } catch {
        setError('Error cargando cliente');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [open, clientId]);

  if (!open) return null;

  const handleChange = e => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.last_name.trim()) {
      setError('Nombre y apellido son obligatorios');
      return;
    }

    setSaving(true);

    try {
      await apiFetch(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          dni: form.dni || null,
          name: form.name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          birth_date: form.birth_date || null,
          notes: form.notes || null
        })
      });

      onUpdated();
      onClose();
    } catch (err) {
      setError('Error guardando cliente (DNI duplicado?)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>Editar cliente</h2>
            <p style={subtitle}>Actualizá la información del cliente</p>
          </div>

          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {loading ? (
          <div>Cargando…</div>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle}>
            <Field label="DNI">
              <input
                name="dni"
                value={form.dni}
                onChange={handleChange}
              />
            </Field>

            <div style={grid2}>
              <Field label="Nombre">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Apellido">
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>

            <Field label="Teléfono">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </Field>

            <Field label="Dirección">
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Field>

            <Field label="Fecha de nacimiento">
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
              />
            </Field>

            <Field label="Notas">
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
              />
            </Field>

            {error && (
              <div style={errorBox}>
                {error}
              </div>
            )}

            <div style={actions}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={cancelBtn}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                style={submitBtn}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- UI ---------- */

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ---------- STYLES ---------- */

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modal = {
  background: '#fff',
  borderRadius: 16,
  width: 580,
  padding: 24,
  boxShadow: '0 20px 60px rgba(0,0,0,.25)'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20
};

const subtitle = {
  fontSize: 13,
  color: '#6b7280'
};

const closeBtn = {
  border: 'none',
  background: 'transparent',
  fontSize: 20,
  cursor: 'pointer'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16
};

const actions = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12
};

const cancelBtn = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontWeight: 600
};

const submitBtn = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700
};

const errorBox = {
  color: '#dc2626',
  fontSize: 13
};

export default ClientDetailModal;
