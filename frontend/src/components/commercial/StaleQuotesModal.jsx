function StaleQuotesModal({ open, onClose, sellerName, quotes }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 3000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: 720,
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          Presupuestos vencidos
        </h2>

        <div style={{ color: '#6b7280', marginBottom: 20 }}>
          Vendedor: <strong>{sellerName}</strong>
        </div>

        {quotes.length === 0 ? (
          <p>No hay presupuestos vencidos.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  fontSize: 13,
                  color: '#6b7280',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <th style={{ padding: '10px 6px' }}>Cliente</th>
                <th style={{ padding: '10px 6px', textAlign: 'right' }}>
                  Monto
                </th>
                <th style={{ padding: '10px 6px' }}>Estado</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>
                  Días
                </th>
              </tr>
            </thead>

            <tbody>
              {quotes.map(q => (
                <tr
                  key={q.id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '12px 6px', fontWeight: 600 }}>
                    {q.client_name}
                  </td>
                  <td
                    style={{
                      padding: '12px 6px',
                      textAlign: 'right'
                    }}
                  >
                    $ {Number(q.total_amount).toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding: '12px 6px' }}>{q.status}</td>
                  <td
                    style={{
                      padding: '12px 6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#dc2626'
                    }}
                  >
                    {q.days_stale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button
            onClick={onClose}
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
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaleQuotesModal;
