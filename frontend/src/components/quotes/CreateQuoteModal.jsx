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

  // 🔽 Forma de pago
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

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

  useEffect(() => {
    if (!open) return;

    setError(null);
    setClientFound(null);
    setVendors([]);
    setLoadingUsers(true);

    setPaymentMethod('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setSaveCard(false);

    getAssignableUsers()
      .then(data => setVendors(data || []))
      .catch(() => setError('No se pudieron cargar los usuarios asignables'))
      .finally(() => setLoadingUsers(false));
  }, [open]);

  if (!open) return null;

  const handleChange = e => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDniBlur = async () => {
    const dni = form.client_dni.trim();
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
      if (err.message?.includes('404')) setClientFound(false);
      else setError('Error buscando cliente por DNI');
    } finally {
      setCheckingDni(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!form.seller_id) {
      setError('Seleccioná un responsable comercial');
      return;
    }

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

        // 🔽 NUEVO: se envía todo
        payment_method: paymentMethod || null,
        card_number: paymentMethod === 'TARJETA' ? cardNumber : null,
        card_expiry: paymentMethod === 'TARJETA' ? cardExpiry : null,
        card_cvv: paymentMethod === 'TARJETA' ? cardCvv : null,
        save_card: paymentMethod === 'TARJETA' ? saveCard : false
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
          <Field label="Responsable comercial">
            <select
              name="seller_id"
              value={form.seller_id}
              onChange={handleChange}
              required
              disabled={loadingUsers}
            >
              <option value="">
                {loadingUsers ? 'Cargando usuarios…' : 'Seleccionar Vendedor'}
              </option>
              {vendors.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </Field>

          <div style={grid2}>
            <Field label="DNI">
              <input
                name="client_dni"
                value={form.client_dni}
                onChange={handleChange}
                onBlur={handleDniBlur}
              />
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

          <Field label="Forma de pago">
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="">Seleccionar forma de pago</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta de crédito</option>
            </select>
          </Field>

          {paymentMethod === 'TARJETA' && (
            <div style={cardBox}>
              <Field label="Número de tarjeta">
                <input
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                />
              </Field>

              <div style={grid2}>
                <Field label="Vencimiento (MM/AA)">
                  <input
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                  />
                </Field>

                <Field label="CVV">
                  <input
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                  />
                </Field>
              </div>

              <label style={{ fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={e => setSaveCard(e.target.checked)}
                />{' '}
                Guardar datos de la tarjeta
              </label>
            </div>
          )}

          {error && (
            <div style={{ color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={actions}>
            <button type="button" onClick={onClose} style={cancelBtn}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={submitBtn}>
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
      <label style={{ fontSize: 12, fontWeight: 600 }}>{label}</label>
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
  padding: 24
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20
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

const cardBox = {
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  background: '#f9fafb'
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
  background: '#fff'
};

const submitBtn = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: '#fff'
};

export default CreateQuoteModal;
