import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import CreateClientModal from '../components/clients/CreateClientModal';
import ClientDetailModal from '../components/clients/ClientDetailModal';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCreateClient, setOpenCreateClient] = useState(false);
  const [openClientDetail, setOpenClientDetail] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/clients');
      setClients(data || []);
    } catch (err) {
      console.error(err);
      setError('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <main style={{ padding: 28 }}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <h1 style={title}>Clientes</h1>
          <p style={subtitle}>
            Gestión y edición de clientes registrados
          </p>
        </div>

        {/* BOTÓN NUEVO CLIENTE */}
        <button
          onClick={() => setOpenCreateClient(true)}
          style={createBtn}
          onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
          onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
          <span>Nuevo cliente</span>
        </button>
      </div>

      {/* STATES */}
      {loading && <Skeleton />}

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {!loading && !clients.length && (
        <div style={emptyBox}>
          No hay clientes cargados
        </div>
      )}

      {/* TABLE */}
      {!loading && clients.length > 0 && (
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <Th>DNI</Th>
                <Th>Cliente</Th>
                <Th>Teléfono</Th>
                <Th>Email</Th>
                <Th>Dirección</Th>
                <Th>Estado</Th>
              </tr>
            </thead>

            <tbody>
              {clients.map(client => (
                <tr
                  key={client.id}
                  style={row}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setOpenClientDetail(true);
                  }}
                >
                  <Td>
                    <strong>{client.dni || '—'}</strong>
                  </Td>

                  <Td>
                    <div style={{ fontWeight: 600 }}>
                      {client.name} {client.last_name}
                    </div>
                    <div style={muted}>
                      ID #{client.id}
                    </div>
                  </Td>

                  <Td>{client.phone || '—'}</Td>
                  <Td>{client.email || '—'}</Td>

                  <Td style={{ maxWidth: 240 }}>
                    {client.address || '—'}
                  </Td>

                  <Td>
                    {client.active ? (
                      <Badge color="green">Activo</Badge>
                    ) : (
                      <Badge color="red">Inactivo</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALES */}
      <CreateClientModal
        open={openCreateClient}
        onClose={() => setOpenCreateClient(false)}
        onCreated={loadClients}
      />

      <ClientDetailModal
        open={openClientDetail}
        clientId={selectedClientId}
        onClose={() => setOpenClientDetail(false)}
        onUpdated={loadClients}
      />
    </main>
  );
}

/* ================= UI COMPONENTS ================= */

const Badge = ({ children, color }) => (
  <span
    style={{
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: color === 'green' ? '#dcfce7' : '#fee2e2',
      color: color === 'green' ? '#166534' : '#991b1b'
    }}
  >
    {children}
  </span>
);

const Th = ({ children }) => (
  <th style={th}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={td}>
    {children}
  </td>
);

const Skeleton = () => (
  <div style={skeleton}>
    Cargando clientes…
  </div>
);

/* ================= STYLES ================= */

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 28
};

const title = {
  fontSize: 26,
  fontWeight: 800,
  margin: 0
};

const subtitle = {
  marginTop: 4,
  fontSize: 13,
  color: '#6b7280'
};

const createBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #dbeafe',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'background .15s ease'
};

const tableWrapper = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,.04)'
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};

const row = {
  cursor: 'pointer',
  transition: 'background .15s ease'
};

const th = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 12,
  fontWeight: 700,
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb'
};

const td = {
  padding: '16px',
  fontSize: 14,
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'middle'
};

const muted = {
  fontSize: 12,
  color: '#6b7280'
};

const skeleton = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 24,
  color: '#9ca3af'
};

const emptyBox = {
  background: '#ffffff',
  border: '1px dashed #e5e7eb',
  borderRadius: 14,
  padding: 32,
  color: '#6b7280',
  textAlign: 'center'
};

const errorBox = {
  background: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: 12,
  padding: 14,
  color: '#991b1b',
  marginBottom: 16
};

export default Clients;
