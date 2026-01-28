function SalesBySellerRanking({ data }) {
  if (!data || !data.length) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          padding: 24,
          color: '#6b7280'
        }}
      >
        No hay datos comerciales aún
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 24,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: 24,
        color: '#111827'
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 12,
            color: '#6b7280',
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: 0.4
          }}
        >
          Performance comercial
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
          Ranking de vendedores
        </h3>
      </div>

      {/* LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map((row, index) => {
          const generated = row.total_quotes ?? 0;
          const approved = row.approved_quotes ?? 0;
          const effectiveness = row.effectiveness ?? 0;

          const isFirst = index === 0;
          const isSecond = index === 1;

          const medal = isFirst ? '🥇' : isSecond ? '🥈' : null;

          return (
            <div
              key={row.seller_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 1fr 140px',
                gap: 16,
                alignItems: 'center',
                padding: '16px 18px',
                borderRadius: 12,
                border: isFirst
                  ? '1px solid #facc15'
                  : isSecond
                  ? '1px solid #cbd5e1'
                  : '1px solid #e5e7eb',
                background: isFirst
                  ? '#fffbeb'
                  : isSecond
                  ? '#f8fafc'
                  : '#f9fafb'
              }}
            >
              {/* POS / MEDAL */}
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: isFirst
                    ? '#ca8a04'
                    : isSecond
                    ? '#64748b'
                    : '#6b7280'
                }}
              >
                {medal ?? index + 1}
              </div>

              {/* SELLER */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {row.seller_name}
                </div>

                {isFirst && (
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#ca8a04'
                    }}
                  >
                    Vendedor destacado
                  </div>
                )}
              </div>

              {/* KPIs */}
              <div
                style={{
                  display: 'flex',
                  gap: 18,
                  fontSize: 12,
                  color: '#6b7280'
                }}
              >
                <div>
                  <div>Generados</div>
                  <strong style={{ fontSize: 15, color: '#111827' }}>
                    {generated}
                  </strong>
                </div>

                <div>
                  <div>Aprobados</div>
                  <strong style={{ fontSize: 15, color: '#111827' }}>
                    {approved}
                  </strong>
                </div>

                <div>
                  <div>Efectividad</div>
                  <strong
                    style={{
                      fontSize: 15,
                      color:
                        effectiveness >= 50
                          ? '#16a34a'
                          : effectiveness > 0
                          ? '#ca8a04'
                          : '#9ca3af'
                    }}
                  >
                    {effectiveness}%
                  </strong>
                </div>
              </div>

              {/* MONTO */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280'
                  }}
                >
                  Monto aprobado
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#16a34a'
                  }}
                >
                  $ {Number(row.total_amount).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SalesBySellerRanking;
