import { useEffect, useMemo, useState } from 'react';
import { getSalesBySeller } from '../../services/metrics.service';
function SalesBySellerRanking() {
  /* =====================
     ESTADO
  ===================== */
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =====================
     FETCH
  ===================== */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getSalesBySeller(month);
        setData(Array.isArray(res?.data) ? res.data : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [month]);

  /* =====================
     HELPERS
  ===================== */
  const formatMonthLabel = (yyyyMm) => {
    if (!yyyyMm) return '';
    const [y, m] = yyyyMm.split('-').map(Number);
    if (!y || !m) return '';
    return new Date(y, m - 1, 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const monthLabel = useMemo(
    () => formatMonthLabel(month),
    [month]
  );

  /* =====================
     RENDER
  ===================== */
  return (
    <div
      style={{
        marginTop: 24,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: 24
      }}
    >
      {/* HEADER + FILTRO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: '#6b7280',
              fontWeight: 600
            }}
          >
            📊 Performance comercial
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            🏆 Ranking de vendedores –{' '}
            <span style={{ textTransform: 'capitalize' }}>
              {monthLabel}
            </span>
          </h3>
        </div>

        {/* FILTRO POR MES */}
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontWeight: 600
          }}
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
          Cargando ranking…
        </div>
      )}

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: '1px dashed #e5e7eb',
            color: '#6b7280',
            textAlign: 'center'
          }}
        >
          🚫 No hubo actividad comercial en{' '}
          <strong style={{ textTransform: 'capitalize' }}>
            {monthLabel}
          </strong>
        </div>
      )}

      {/* LISTADO */}
      {!loading && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map((row, index) => {
            const generated = Number(row.generated_quotes) || 0;
            const approved = Number(row.approved_quotes) || 0;
            const effectiveness =
              typeof row.effectiveness === 'number'
                ? row.effectiveness
                : generated > 0
                ? Math.round((approved / generated) * 100)
                : 0;

            const rank =
              index === 0 ? '🥇' :
              index === 1 ? '🥈' :
              index === 2 ? '🥉' :
              index + 1;

            return (
              <div
                key={row.seller_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr repeat(3, 1fr)',
                  gap: 16,
                  padding: '16px 18px',
                  borderRadius: 12,
                  background: index === 0 ? '#f0f9ff' : '#f9fafb',
                  border:
                    index === 0
                      ? '2px solid #38bdf8'
                      : '1px solid #e5e7eb',
                  alignItems: 'center'
                }}
              >
                {/* RANK */}
                <div style={{ fontWeight: 800, textAlign: 'center' }}>
                  {rank}
                </div>

                {/* VENDEDOR */}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    👤 {row.seller_name || 'Sin nombre'}
                  </div>
                  {index === 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#0284c7',
                        fontWeight: 600
                      }}
                    >
                      Vendedor destacado
                    </div>
                  )}
                </div>

                {/* GENERADOS */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    📄 Generados
                  </div>
                  <div style={{ fontWeight: 800 }}>{generated}</div>
                </div>

                {/* APROBADOS */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    ✅ Aprobados
                  </div>
                  <div style={{ fontWeight: 800 }}>{approved}</div>
                </div>

                {/* EFECTIVIDAD */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    📊 Efectividad
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color:
                        effectiveness >= 80
                          ? '#16a34a'
                          : effectiveness >= 50
                          ? '#ca8a04'
                          : '#9ca3af'
                    }}
                  >
                    {effectiveness}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SalesBySellerRanking;