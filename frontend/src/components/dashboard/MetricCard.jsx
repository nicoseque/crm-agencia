import { useEffect, useState } from 'react';

function MetricCard({
  title,
  value,
  isMoney = false,
  subtitle,
  icon,
  footer,
  index = 0 // 👈 orden para el delay
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  const display =
    isMoney && typeof value === 'number'
      ? `$ ${value.toLocaleString('es-AR')}`
      : value;

  return (
    <div
      style={{
        flex: 1,
        padding: 20,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,

        /* 🎬 ANIMACIÓN */
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'translateY(0)'
          : 'translateY(60px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: '#6b7280'
        }}
      >
        {icon && (
          <span style={{ fontSize: 18, lineHeight: 1 }}>
            {icon}
          </span>
        )}
        <span>{title}</span>
      </div>

      {/* VALUE */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: '#111827',
          lineHeight: 1.2
        }}
      >
        {display}
      </div>

      {/* SUBTITLE */}
      {subtitle && (
        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            color: '#9ca3af'
          }}
        >
          {subtitle}
        </div>
      )}

      {/* FOOTER */}
      {footer && (
        <div style={{ marginTop: 4 }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
