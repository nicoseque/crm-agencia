import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

function SalesByMonthChart({ refreshToken }) {
  const [data, setData] = useState([]);

  const load = async () => {
    try {
      const res = await apiFetch('/metrics/sales-by-month');
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Error cargando ventas por mes', e);
      setData([]);
    }
  };

  useEffect(() => {
    load();
  }, [refreshToken]);

  if (!data.length) return null;

  const amounts = data.map(d => Number(d.total) || 0);
  const maxAmount = Math.max(...amounts, 1);

  return (
<div
  style={{
    marginTop: 40,
    padding: 20,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#ffffff',
    color: '#111827'
  }}
>
      <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>
        Ventas aprobadas por mes
      </h3>

      {data.map(row => {
        const total = Number(row.total) || 0;
        const percent = (total / maxAmount) * 100;

        const [year, month] = row.month.split('-');
        const label = new Intl.DateTimeFormat('es-AR', {
          month: 'long',
          year: 'numeric'
        }).format(new Date(Number(year), Number(month) - 1, 1));

        return (
          <div key={row.month} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 13,
                marginBottom: 4,
                color: '#374151',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>{label}</span>
              <strong>$ {total.toLocaleString('es-AR')}</strong>
            </div>

            <div
              style={{
                height: 10,
                background: '#1f2937',
                borderRadius: 6,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                  borderRadius: 6
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SalesByMonthChart;
