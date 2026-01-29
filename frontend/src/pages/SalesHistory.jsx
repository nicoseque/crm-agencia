import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function SalesHistory() {
  const [data, setData] = useState([]);
  const [range, setRange] = useState(6);

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/metrics/sales-by-month');
      setData(Array.isArray(res) ? res : []);
    };
    load();
  }, []);

  const now = new Date();

  const months = useMemo(() => {
    return data
      .filter(row => {
        const [y, m] = row.month.split('-').map(Number);
        return new Date(y, m - 1, 1) <= now;
      })
      .slice(-range);
  }, [data, range]);

  const totals = months.map(m => Number(m.total) || 0);
  const maxAmount = Math.max(...totals, 1);
  const avg = totals.length
    ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
    : 0;

  const bestMonth = months.reduce(
    (best, cur) => (Number(cur.total) > Number(best.total) ? cur : best),
    months[0] || {}
  );

  const exportPdf = () => {
    window.print();
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 28
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
          >
            Performance comercial
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            Histórico de ventas
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={range}
            onChange={e => setRange(Number(e.target.value))}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              fontWeight: 600
            }}
          >
            <option value={3}>Últimos 3 meses</option>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
          </select>

          <button
            onClick={exportPdf}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: '#111827',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* PROMEDIO */}
      <div
        style={{
          marginBottom: 30,
          padding: 20,
          borderRadius: 14,
          background: '#f8fafc',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Promedio mensual
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#111827'
          }}
        >
          $ {avg.toLocaleString('es-AR')}
        </div>
      </div>

      {/* MONTH CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {months.map(row => {
          const total = Number(row.total);
          const percent = (total / maxAmount) * 100;

          // 🔧 FIX REAL: buscar mes calendario anterior
          const [y, m] = row.month.split('-').map(Number);

const prevYear = m === 1 ? y - 1 : y;
const prevMonthNum = m === 1 ? 12 : m - 1;

const prevKey = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;
const prevMonth =
  months.find(p => p.month === prevKey) || null;

          const diff =
            prevMonth && Number(prevMonth.total) > 0
              ? Math.round(
                  ((total - Number(prevMonth.total)) /
                    Number(prevMonth.total)) *
                    100
                )
              : null;

          const label = capitalize(
            new Intl.DateTimeFormat('es-AR', {
              month: 'long',
              year: 'numeric'
            }).format(new Date(y, m - 1, 1))
          );

          const isBest = row.month === bestMonth.month;
          const aboveAvg = total >= avg;

          return (
            <div
              key={row.month}
              style={{
                padding: 20,
                borderRadius: 14,
                border: isBest
                  ? '2px solid #22c55e'
                  : '1px solid #e5e7eb',
                background: isBest ? '#ecfdf5' : '#f9fafb'
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10
                }}
              >
                <div style={{ fontWeight: 700 }}>{label}</div>

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#16a34a'
                  }}
                >
                  $ {total.toLocaleString('es-AR')}
                </div>
              </div>

              {/* METRICS */}
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  fontSize: 13,
                  marginBottom: 10
                }}
              >
                <div>
                  {diff !== null ? (
                    <span
                      style={{
                        color: diff >= 0 ? '#16a34a' : '#dc2626',
                        fontWeight: 700
                      }}
                    >
                      {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)}%
                    </span>
                  ) : (
                    '—'
                  )}{' '}
                  vs mes anterior
                </div>

                <div
                  style={{
                    color: aboveAvg ? '#16a34a' : '#dc2626',
                    fontWeight: 700
                  }}
                >
                  {aboveAvg ? '▲' : '▼'}{' '}
                  {aboveAvg ? 'Sobre' : 'Bajo'} promedio
                </div>

                {isBest && (
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#16a34a'
                    }}
                  >
                    ⭐ Mes destacado
                  </div>
                )}
              </div>

              {/* BAR */}
              <div
                style={{
                  height: 10,
                  background: '#e5e7eb',
                  borderRadius: 6,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background:
                      'linear-gradient(90deg, #2563eb, #60a5fa)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SalesHistory;
