function PipelineCard({
  name,
  sellerName,
  amount,
  createdAt,
  onClick,
  id,
  status
}) {
  // ---------- FECHA RELATIVA ----------
  let diffDays = 0;

  if (createdAt) {
    const created = new Date(createdAt);
    const today = new Date();

    if (!isNaN(created)) {
      created.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      diffDays = Math.floor(
        (today - created) / (1000 * 60 * 60 * 24)
      );
    }
  }

  let dateText = 'Hoy';
  if (diffDays === 1) dateText = 'Hace 1 día';
  if (diffDays > 1) dateText = `Hace ${diffDays} días`;

  const isExpired = diffDays >= 3;

  // ---------- STATUS ----------
  const isLocked = status === 'APROBADO' || status === 'CANCELADO';

  const statusColor =
    status === 'APROBADO'
      ? '#22c55e'
      : status === 'CANCELADO'
      ? '#ef4444'
      : '#2563eb';

  const handleDragStart = (e) => {
    if (isLocked) return;
    e.dataTransfer.setData('leadId', id);
  };

  // ---------- STYLES DINÁMICOS ----------
  const cardStyle = {
    background: isExpired && !isLocked ? '#fff5f5' : '#ffffff',
    border: isExpired && !isLocked
      ? '1.5px solid #fca5a5'
      : '1.5px solid #d1d5db',
    borderLeft: `5px solid ${statusColor}`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    cursor: isLocked ? 'default' : 'pointer',
    opacity: isLocked ? 0.75 : 1,
    boxShadow: '0 1px 3px rgba(0,0,0,.08)'
  };

  return (
    <div
      draggable={!isLocked}
      onDragStart={handleDragStart}
      onClick={onClick}
      style={cardStyle}
    >
      {/* CLIENTE */}
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
        👤 {name || 'Sin nombre'}
      </div>

      {/* MONTO */}
      <div
        style={{
          marginTop: 6,
          fontSize: 16,
          fontWeight: 700,
          color: '#2563eb'
        }}
      >
        💰 $ {Number(amount || 0).toLocaleString('es-AR')}
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#6b7280'
        }}
      >
        <div>
          🧑‍💼 {sellerName || 'Sin vendedor'}
        </div>
        <div>
          ⏱️ {dateText}
        </div>
      </div>

      {/* VENCIDO */}
      {!isLocked && isExpired && (
        <div
          style={{
            marginTop: 8,
            fontSize: 10,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 8,
            background: '#fee2e2',
            color: '#991b1b',
            display: 'inline-block'
          }}
        >
          VENCIDO · RESOLVER
        </div>
      )}

      {/* BADGE ESTADO FINAL */}
      {isLocked && (
        <div
          style={{
            marginTop: 8,
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background:
              status === 'APROBADO' ? '#dcfce7' : '#fee2e2',
            color:
              status === 'APROBADO' ? '#166534' : '#991b1b'
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}

export default PipelineCard;
