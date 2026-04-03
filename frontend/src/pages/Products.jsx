import { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct
} from '../services/products.service';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 FORM / MODAL
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    model: '',
    plan_type: '',
    vehicle_value: '',
    installments: '',
    active: true
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando productos', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      model: '',
      plan_type: '',
      vehicle_value: '',
      installments: '',
      active: true
    });
    setOpenForm(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      model: p.model,
      plan_type: p.plan_type,
      vehicle_value: p.vehicle_value,
      installments: p.installments,
      active: p.active
    });
    setOpenForm(true);
  };

  const submit = async () => {
    try {
      const payload = {
        ...form,
        vehicle_value: Number(form.vehicle_value),
        installments: Number(form.installments)
      };

      if (editing) {
        await updateProduct(editing, payload);
      } else {
        await createProduct(payload);
      }

      setOpenForm(false);
      await load();
    } catch (e) {
      console.error('Error guardando producto', e);
      alert('Error guardando producto');
    }
  };

  if (loading) return <p>Cargando productos…</p>;

  return (
    <>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 24
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            Productos
          </h1>

          <button
            onClick={openNew}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Nuevo producto
          </button>
        </div>

        {/* TABLE */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: 'left',
                fontSize: 13,
                color: '#6b7280',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <th style={{ padding: 12 }}>Marca y Modelo</th>
              <th style={{ padding: 12 }}>Plan</th>
              <th style={{ padding: 12 }}>Cuotas</th>
              <th style={{ padding: 12, textAlign: 'right' }}>
                Valor vehículo
              </th>
              <th style={{ padding: 12, textAlign: 'center' }}>
                Estado
              </th>
              <th style={{ padding: 12 }} />
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: '#6b7280'
                  }}
                >
                  No hay productos cargados
                </td>
              </tr>
            )}

            {products.map(p => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <td style={{ padding: 12, fontWeight: 700 }}>
                  {p.model}
                </td>
                <td style={{ padding: 12 }}>{p.plan_type}</td>
                <td style={{ padding: 12 }}>{p.installments}</td>
                <td
                  style={{
                    padding: 12,
                    textAlign: 'right',
                    fontWeight: 600
                  }}
                >
                  $ {Number(p.vehicle_value).toLocaleString('es-AR')}
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  {p.active ? '🟢 Activo' : '🔴 Inactivo'}
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#2563eb',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {openForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              width: 420
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            <input
              placeholder="Marca, Modelo y versión"
              value={form.model}
              onChange={e =>
                setForm({ ...form, model: e.target.value })
              }
              style={input}
            />

            <input
              placeholder="Tipo de Plan (Ej. 80/20) "
              value={form.plan_type}
              onChange={e =>
                setForm({ ...form, plan_type: e.target.value })
              }
              style={input}
            />

            <input
              type="number"
              placeholder="Cantidad de cuotas"
              value={form.installments}
              onChange={e =>
                setForm({ ...form, installments: e.target.value })
              }
              style={input}
            />

            <input
              type="number"
              placeholder="Valor total del vehículo"
              value={form.vehicle_value}
              onChange={e =>
                setForm({ ...form, vehicle_value: e.target.value })
              }
              style={input}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={submit}
                style={primaryBtn}
              >
                Guardar
              </button>
              <button
                onClick={() => setOpenForm(false)}
                style={secondaryBtn}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const input = {
  width: '100%',
  marginTop: 12,
  padding: 10,
  borderRadius: 8,
  border: '1px solid #e5e7eb'
};

const primaryBtn = {
  flex: 1,
  padding: 10,
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer'
};

const secondaryBtn = {
  flex: 1,
  padding: 10,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  cursor: 'pointer'
};

export default Products;
