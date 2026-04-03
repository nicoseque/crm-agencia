import { useEffect, useState } from 'react';
import { createQuote } from '../../services/quotes.service';
import { apiFetch } from '../../services/api';
import { getAssignableUsers } from '../../services/users.service';

function CreateQuoteModal({ open, onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    product: '',
    product_id: '',
    total_amount: '',
    client_first_name: '',
    client_last_name: '',
    seller_id: '',
    installments_qty: '',
    installment_final: '',
    installment_pure: '',
    retiro_from_installment: '',
    mechanisms: '',
    retiro_costs: '',
    adjudication_programmed: '',
    has_used_vehicle: false,
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_version: '',
    vehicle_year: '',
    vehicle_price: '',
    benefits: '',
    plan_type: ''
  });

  useEffect(() => {
    if (!open) return;

    apiFetch('/products')
      .then(data =>
        setProducts(Array.isArray(data) ? data.filter(p => p.active) : [])
      )
      .catch(() => setProducts([]));

    getAssignableUsers()
      .then(setVendors)
      .catch(() => setVendors([]));

    setError(null);
  }, [open]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductChange = (e) => {
    const productId = Number(e.target.value);
    const p = products.find(x => x.id === productId);
    if (!p) return;

    setForm(prev => ({
      ...prev,
      product_id: productId,
      product: `${p.model} – Plan ${p.plan_type}`,
      total_amount: p.vehicle_value || '',
      installments_qty: p.installments || '',
      plan_type: p.plan_type || ''
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createQuote({
        ...form,
        seller_id: Number(form.seller_id),
        total_amount: Number(form.total_amount),
        installments_qty: Number(form.installments_qty),
        installment_final: Number(form.installment_final),
        installment_pure: Number(form.installment_pure),
        retiro_from_installment: Number(form.retiro_from_installment),
        vehicle_year: form.has_used_vehicle ? Number(form.vehicle_year) : null,
        vehicle_price: form.has_used_vehicle ? Number(form.vehicle_price) : null
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
          <h3>Nuevo presupuesto</h3>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          
          <Section title="Producto">
            <select required value={form.product_id} onChange={handleProductChange}>
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.model} – Plan {p.plan_type}
                </option>
              ))}
            </select>

            <Field label="Valor del producto">
              <input
                type="number"
                name="total_amount"
                value={form.total_amount}
                readOnly
              />
            </Field>

            <Field label="Tipo de plan">
              <input value={form.plan_type} readOnly />
            </Field>
          </Section>

          <Section title="Cliente">
            <Grid>
              <Field label="Nombre">
                <input name="client_first_name" value={form.client_first_name} onChange={handleChange} required />
              </Field>
              <Field label="Apellido">
                <input name="client_last_name" value={form.client_last_name} onChange={handleChange} required />
              </Field>
            </Grid>
          </Section>

          <Section title="Vendedor">
            <select name="seller_id" value={form.seller_id} onChange={handleChange} required>
              <option value="">Seleccionar vendedor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </Section>

          <Section title="Datos del plan">
            <Grid>
              <Field label="Cantidad de cuotas">
                <input
                  type="number"
                  name="installments_qty"
                  value={form.installments_qty}
                  readOnly
                />
              </Field>

              <Field label="Cuota final">
                <input type="number" name="installment_final" value={form.installment_final} onChange={handleChange} required />
              </Field>

              <Field label="Cuota pura">
                <input type="number" name="installment_pure" value={form.installment_pure} onChange={handleChange} required />
              </Field>

              <Field label="Retiro desde cuota">
                <input type="number" name="retiro_from_installment" value={form.retiro_from_installment} onChange={handleChange} required />
              </Field>

              <Field label="Mecanismos">
                <input name="mechanisms" value={form.mechanisms} onChange={handleChange} />
              </Field>

              <Field label="Gastos de retiro (%)">
                <input
                  type="text"
                  name="retiro_costs"
                  value={form.retiro_costs}
                  onChange={handleChange}
                  placeholder="Ej: 10% o A definir"
                />
              </Field>

              <Field label="Adjudicación programada">
                <input name="adjudication_programmed" value={form.adjudication_programmed} onChange={handleChange} />
              </Field>
            </Grid>
          </Section>

          <Section title="¿Entrega vehículo usado en parte de pago?">
            <label style={{ fontSize: 13 }}>
              <input type="checkbox" name="has_used_vehicle" checked={form.has_used_vehicle} onChange={handleChange} /> Sí
            </label>
          </Section>

          <Section title={`Beneficios para ${form.client_first_name || 'el cliente'}`}>
            <Field>
              <textarea
                name="benefits"
                value={form.benefits}
                onChange={handleChange}
                style={{
                  width: '100%',
                  minHeight: 150,
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </Field>
          </Section>

          {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}

          <div style={actions}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancelar</button>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? 'Creando…' : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* helpers */
const Section = ({ title, children }) => (
  <div>
    <h4 style={{ margin: '10px 0 6px' }}>{title}</h4>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: 12 }}>{label}</label>}
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    {children}
  </div>
);

/* estilos */
const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modal = {
  background: '#fff',
  width: 620,
  maxHeight: '90vh',
  borderRadius: 14,
  padding: 16,
  display: 'flex',
  flexDirection: 'column'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtn = {
  border: 'none',
  background: 'transparent',
  fontSize: 18,
  cursor: 'pointer'
};

const formStyle = {
  overflowY: 'auto',
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

const actions = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 10
};

const cancelBtn = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #e5e7eb'
};

const submitBtn = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#2563eb',
  color: '#fff'
};

export default CreateQuoteModal;