import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

function SalesByMonthChart({ refreshToken }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      const res = await apiFetch('/metrics/sales-by-month');

      if (!Array.isArray(res)) {
        console.error('Respuesta inválida:', res);
        setData([]);
        return;
      }

      // filtramos SOLO filas válidas
      const safe = res.filter(
        r =>
          r &&
          typeof r.month_label === 'string' &&
          r.month_label.includes('-') &&
          !isNaN(Number(r.total))
      );

      setData(safe);
    } catch (e) {
      console.error('Error cargando planes por mes', e);
      setError(true);
      setData([]);
    }
  };

  useEffect(() => {
    load();
  }, [refreshToken]);

  // ⛔ si hay error, no renderizamos nada
  if (error) return null;
  if (!data.length) return null;

  const renderData = [...data].reverse();

  const counts = renderData.map(d => Number(d.total) || 0);
  const maxCount = Math.max(...counts, 1);

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
        Planes aprobados por mes
      </h3>

      {renderData.map(row => {
        let label = row.month_label;

        try {
          const [year, month] = row.month_label.split('-');
          label = new Intl.DateTimeFormat('es-AR', {
            month: 'long',
            year: 'numeric'
          }).format(new Date(Number(year), Number(month) - 1, 1));
        } catch {
          return null;
        }

        const total = Number(row.total) || 0;
        const percent = (total / maxCount) * 100;

        return (
          <div key={row.month_label} style={{ marginBottom: 14 }}>
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
              <strong>{total} planes</strong>
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