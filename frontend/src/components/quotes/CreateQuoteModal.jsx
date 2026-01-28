import { useEffect, useState } from 'react';
import { createQuote } from '../../services/quotes.service';
import { getAssignableUsers } from '../../services/users.service';
import { apiFetch } from '../../services/api';

function CreateQuoteModal({ open, onClose, onCreated }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  const [clientFound, setClientFound] = useState(null);
  const [checkingDni, setCheckingDni] = useState(false);

  const [form, setForm] = useState({
    seller_id: '',
    client_dni: '',
    client_first_name: '',
    client_last_name: '',
    interest_type: '',
    product: '',
    description: '',
    total_amount: '',
    currency: 'ARS'
  });

  // 🔄 Reset + carga de usuarios al abrir
  useEffect(() => {
    if (!open) return;

    setError(null);
    setClientFound(null);
    setVendors([]);
    setLoadingUsers(true);

    getAssignableUsers()
      .then(data => {
        setVendors(data || []);
      })
      .catch(() => {
        setError('No se pudieron cargar los usuarios asignables');
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // 🆕 AUTOCOMPLETE POR DNI (DNI NO obligatorio)
  const handleDniBlur = async () => {
    const dni = form.client_dni.trim();

    // 👉 Sin DNI: no validar y no bloquear
    if (!dni) {
      setClientFound(null);
      return;
    }

    setCheckingDni(true);
    setClientFound(null);

    try {
      const client = await apiFetch(`/clients/by-dni/${dni}`);
      if (client) {
        setClientFound(client);
        setForm(prev => ({
          ...prev,
          client_first_name: client.name || '',
          client_last_name: client.last_name || ''
        }));
      }
    } catch (err) {
      // apiFetch tira Error genérico
      if (err.message?.includes('404')) {
        setClientFound(false);
      } else {
        setError('Error buscando cliente por DNI');
      }
    } finally {
      setCheckingDni(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.seller_id) {
      setError('Seleccioná un responsable comercial');
      return;
    }

    // 🛑 SOLO bloquear si hay DNI y NO existe
    if (form.client_dni.trim() && clientFound === false) {
      setError(
        'El DNI ingresado no pertenece a un cliente existente. Registrá el cliente o quitá el DNI.'
      );
      return;
    }

    setLoading(true);

    try {
      await createQuote({
        seller_id: Number(form.seller_id),
        client_dni: form.client_dni.trim() || null,
        client_first_name: form.client_first_name.trim(),
        client_last_name: form.client_last_name.trim(),
        interest_type: form.interest_type.trim(),
        product: form.product.trim(),
        description: form.description?.trim() || null,
        total_amount: Number(form.total_amount),
        currency: form.currency,
        plan_id: null,
        vehicle_id: null
      });

      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Error creando presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>Nuevo presupuesto</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Cargá los datos del cliente y del responsable
            </p>
          </div>

          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* RESPONSABLE */}
          <Field label="Responsable comercial">
            <select
              name="seller_id"
              value={form.seller_id}
              onChange={handleChange}
              required
              disabled={loadingUsers}
            >
              <option value="">
                {loadingUsers ? 'Cargando usuarios…' : 'Seleccionar usuario'}
              </option>
              {vendors.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </Field>

          {/* CLIENTE */}
          <div style={grid2}>
            <Field label="DNI">
              <input
                name="client_dni"
                value={form.client_dni}
                onChange={handleChange}
                onBlur={handleDniBlur}
              />
              {checkingDni && (
                <small style={{ fontSize: 11, color: '#6b7280' }}>
                  Buscando cliente…
                </small>
              )}
              {clientFound === false && (
                <small style={{ fontSize: 11, color: '#dc2626' }}>
                  El DNI no pertenece a un cliente registrado
                </small>
              )}
            </Field>

            <Field label="Nombre">
              <input
                name="client_first_name"
                value={form.client_first_name}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Apellido">
              <input
                name="client_last_name"
                value={form.client_last_name}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          {/* PRODUCTO */}
          <div style={grid2}>
            <Field label="Producto">
              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Tipo de interés">
              <input
                name="interest_type"
                value={form.interest_type}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <Field label="Descripción (opcional)">
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </Field>

          {/* MONTO */}
          <div style={grid2}>
            <Field label="Monto total">
              <input
                type="number"
                name="total_amount"
                value={form.total_amount}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Moneda">
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </Field>
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div style={actions}>
            <button
              type="button"
              onClick={onClose}
              style={cancelBtn}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={submitBtn}
            >
              {loading ? 'Creando…' : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- AUX ---------- */

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
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
  width: 560,
  padding: 24,
  boxShadow: '0 20px 60px rgba(0,0,0,.2)'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 20
};

const closeBtn = {
  border: 'none',
  background: 'transparent',
  fontSize: 20,
  cursor: 'pointer',
  color: '#6b7280'
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
  gap: 12,
  marginTop: 10
};

const cancelBtn = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

const submitBtn = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

export default CreateQuoteModal;
