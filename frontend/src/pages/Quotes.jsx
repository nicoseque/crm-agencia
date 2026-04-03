import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuotes } from '../services/quotes.service';

const statusConfig = {
  TODOS: { label: 'Todos', color: '#111827', bg: '#f3f4f6' },
  BORRADOR: { label: 'Borradores', color: '#92400e', bg: '#fef3c7' },
  ENVIADO: { label: 'Enviados', color: '#0369a1', bg: '#e0f2fe' },
  APROBADO: { label: 'Aprobados', color: '#166534', bg: '#dcfce7' },
  CANCELADO: { label: 'Cancelados', color: '#991b1b', bg: '#fee2e2' }
};

function Quotes() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadQuotes = async (value = '') => {
    setLoading(true);
    try {
      const data = await getAllQuotes(value);
      setQuotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadQuotes(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const metrics = useMemo(() => {
    const base = { total: quotes.length };
    quotes.forEach(q => {
      base[q.status] = (base[q.status] || 0) + 1;
    });
    return base;
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    if (statusFilter === 'TODOS') return quotes;
    return quotes.filter(q => q.status === statusFilter);
  }, [quotes, statusFilter]);

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 12px 30px rgba(0,0,0,.06)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}
        >
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Presupuestos</h2>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Gestión y seguimiento de presupuestos
            </div>
          </div>

          <input
            type="text"
            placeholder="Buscar por presupuesto, DNI, cliente, producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 360,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              fontSize: 14
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 20
          }}
        >
          <MetricCard label="Total" value={metrics.total || 0} strong />
          <MetricCard label="Aprobados" value={metrics.APROBADO || 0} />
          <MetricCard label="Enviados" value={metrics.ENVIADO || 0} />
          <MetricCard label="Borradores" value={metrics.BORRADOR || 0} />
          <MetricCard label="Cancelados" value={metrics.CANCELADO || 0} />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap'
          }}
        >
          {Object.keys(statusConfig).map((key) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid #111827' : '1px solid #e5e7eb',
                  background: active ? '#111827' : '#fff',
                  color: active ? '#fff' : '#374151',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {statusConfig[key].label}
              </button>
            );
          })}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 13, color: '#6b7280' }}>
                <th>ID</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 20 }}>Cargando…</td></tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} style={{ background: '#f9fafb' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>#{q.id}</td>
                    <td style={{ padding: 12 }}>{q.client_first_name} {q.client_last_name}</td>
                    <td style={{ padding: 12 }}>{q.client_dni}</td>
                    <td style={{ padding: 12 }}>{q.product}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>
                      {Number(q.total_amount).toLocaleString()} {q.currency}
                    </td>
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: statusConfig[q.status]?.bg,
                          color: statusConfig[q.status]?.color
                        }}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>

                    {/* 🔥 BOTÓN VER PDF */}
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('token');

                          fetch(`${import.meta.env.VITE_API_URL}/quotes/${q.id}/pdf`, {
                            headers: {
                              Authorization: `Bearer ${token}`
                            }
                          })
                            .then(res => res.blob())
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, '_blank');
                            });
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: 'none',
                          background: '#2563eb',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        Ver
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, strong }) {
  return (
    <div
      style={{
        background: '#f9fafb',
        padding: '14px 16px',
        borderRadius: 14
      }}
    >
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div
        style={{
          fontSize: strong ? 22 : 18,
          fontWeight: 700,
          marginTop: 4
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default Quotes;