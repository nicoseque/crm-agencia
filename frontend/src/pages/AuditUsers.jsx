import { useEffect, useState } from 'react';
import { getUsersAudit } from '../services/audit.service';

export default function AuditUsers() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getUsersAudit().then(setLogs);
  }, []);

  const actionBadge = (action) => {
    const isDeactivate = action.includes('DEACTIVATE');

    return {
      text: action.replace('_', ' '),
      style: {
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
        background: isDeactivate ? '#fee2e2' : '#dcfce7',
        color: isDeactivate ? '#991b1b' : '#166534',
      },
    };
  };

  return (
    <div
      style={{
        padding: 32,
        background: '#f3f4f6',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 40px rgba(0,0,0,.08)',
        }}
      >
        <h2 style={{ marginBottom: 24 }}>Auditoría de Usuarios</h2>

        <table
          width="100%"
          cellPadding="14"
          style={{
            borderCollapse: 'collapse',
            textAlign: 'center',
          }}
        >
          <thead>
            <tr style={{ color: '#6b7280', fontSize: 13 }}>
              <th>Acción</th>
              <th>Usuario afectado</th>
              <th>Realizado por</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((l) => {
              const badge = actionBadge(l.action);

              return (
                <tr
                  key={l.id}
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    fontSize: 14,
                  }}
                >
                  <td>
                    <span style={badge.style}>{badge.text}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{l.target_user}</td>
                  <td>{l.performed_by}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: '#9ca3af',
              fontSize: 14,
            }}
          >
            No hay registros de auditoría todavía
          </div>
        )}
      </div>
    </div>
  );
}
