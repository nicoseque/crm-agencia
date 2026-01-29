import { useEffect, useState } from 'react';
import MetricCard from '../components/dashboard/MetricCard';
import Pipeline from '../components/pipeline/Pipeline';
import QuoteHistory from '../components/quotes/QuoteHistory';
import CreateQuoteModal from '../components/quotes/CreateQuoteModal';

import { updateQuoteStatus } from '../services/quotes.service';
import { getDashboardKpis } from '../services/metrics.service';
import { getPipeline } from '../services/pipeline.service';

function Dashboard() {
  const [columns, setColumns] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const [kpis, setKpis] = useState(null);
  const [loadingKpis, setLoadingKpis] = useState(true);

  const [openCreateQuote, setOpenCreateQuote] = useState(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  const loadPipeline = async () => {
    const data = await getPipeline();
    setColumns(data?.columns || []);
  };

  const loadKpis = async () => {
    setLoadingKpis(true);
    const data = await getDashboardKpis();
    setKpis(data);
    setLoadingKpis(false);
  };

  const loadAll = async () => {
    await loadPipeline();
    await loadKpis();
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = async () => {
    await updateQuoteStatus(selectedLead.id, 'APROBADO');
    setSelectedLead(null);
    await loadAll();
  };

  const handleMoveToSent = async () => {
    await updateQuoteStatus(selectedLead.id, 'ENVIADO');
    setSelectedLead(null);
    await loadAll();
  };

  /* =========================
     🔥 CÁLCULO DE VENCIDOS
     ========================= */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredCount = columns.reduce((acc, col) => {
    col.leads?.forEach(lead => {
      if (!lead.created_at) return;
      if (lead.status === 'APROBADO' || lead.status === 'CANCELADO') return;

      const created = new Date(lead.created_at);
      created.setHours(0, 0, 0, 0);

      const diffDays =
        (today - created) / (1000 * 60 * 60 * 24);

      if (diffDays >= 3) acc += 1;
    });
    return acc;
  }, 0);

  return (
    <>
      <main style={{ flex: 1, padding: 24 }}>
        {/* KPIs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 16,
            marginBottom: 20
          }}
        >
          <MetricCard
            title="Presupuestos activos"
            value={loadingKpis ? '…' : kpis?.leads_activos ?? 0}
            subtitle="En pipeline"
            icon="📋"
            footer={
              expiredCount > 0 && (
                <div
                  onClick={() => setShowExpiredOnly(v => !v)}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#dc2626',
                    cursor: 'pointer'
                  }}
                >
                  {expiredCount}{' '}
                  {expiredCount === 1 ? 'vencido' : 'vencidos'}
                </div>
              )
            }
          />

          <MetricCard
            title="Presupuestos enviados"
            value={loadingKpis ? '…' : kpis?.enviados ?? 0}
            subtitle="Esperando respuesta"
            icon="📤"
          />

          <MetricCard
  title="Tasa de aprobación"
  value={
    loadingKpis
      ? '…'
      : `${
          (kpis?.aprobados +
            kpis?.enviados +
            kpis?.cancelados +
            kpis?.leads_activos) > 0
            ? Math.round(
                (kpis.aprobados /
                  (kpis.aprobados +
                    kpis.enviados +
                    kpis.cancelados +
                    kpis.leads_activos)) *
                  100
              )
            : 0
        }%`
  }
  subtitle="Aprobados / Generados"
  icon="📈"
/>


          <MetricCard
            title="Ventas del mes"
            value={
              loadingKpis
                ? '…'
                : `$ ${Number(kpis?.ventas_mes_actual || 0).toLocaleString(
                    'es-AR'
                  )}`
            }
            subtitle="Mes en curso"
            icon="💵"
          />

          <MetricCard
            title="Variación mensual"
            value={loadingKpis ? '…' : `${kpis?.variacion_mes ?? 0}%`}
            subtitle="Vs mes anterior"
            icon="📊"
          />

          <MetricCard
            title="Ticket promedio"
            value={
              loadingKpis
                ? '…'
                : `$ ${Number(kpis?.ticket_promedio || 0).toLocaleString(
                    'es-AR'
                  )}`
            }
            subtitle="Solo aprobados"
            icon="🎯"
          />
        </div>

        {/* PIPELINE */}
        <Pipeline
          columns={columns}
          onSelectLead={setSelectedLead}
          onDropLead={async (id, status) => {
            await updateQuoteStatus(id, status);
            await loadAll();
          }}
          forceShowExpired={showExpiredOnly}
        />
      </main>

      {/* SIDEBAR */}
      {selectedLead && (
        <div style={panelWrapper}>
          <div style={panelHeader}>
            <div style={{ fontWeight: 800 }}>
              Presupuesto #{selectedLead.id}
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              style={closeIcon}
            >
              ✕
            </button>
          </div>

          <div style={panelContent}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                CLIENTE
              </div>
              <div style={{ fontSize: 15 }}>
                {selectedLead.client_name}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                MONTO
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                $ {Number(selectedLead.amount || 0).toLocaleString('es-AR')}
              </div>
            </div>

            <button
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_API_URL}/quotes/${selectedLead.id}/pdf`,
                  '_blank'
                )
              }
              style={primaryBtn}
            >
              📄 Generar PDF
            </button>

            {selectedLead.status === 'BORRADOR' && (
              <button onClick={handleMoveToSent} style={secondaryBtn}>
                📤 Enviar presupuesto
              </button>
            )}

            {selectedLead.status === 'ENVIADO' && (
              <button onClick={handleApprove} style={approveBtn}>
                ✅ Aprobar presupuesto
              </button>
            )}

            <div style={{ marginTop: 24 }}>
              <QuoteHistory quoteId={selectedLead.id} />
            </div>
          </div>

          <div style={panelFooter}>
            <button
              onClick={() => setSelectedLead(null)}
              style={footerClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* NUEVO PRESUPUESTO */}
      <button
        onClick={() => setOpenCreateQuote(true)}
        title="Nuevo presupuesto"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 58,
          height: 58,
          borderRadius: '50%',
          fontSize: 30,
          border: 'none',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 12px 30px rgba(37,99,235,.45)',
          zIndex: 1000
        }}
      >
        +
      </button>

      <CreateQuoteModal
        open={openCreateQuote}
        onClose={() => setOpenCreateQuote(false)}
        onCreated={loadAll}
      />
    </>
  );
}

export default Dashboard;

/* =========================
   🎨 ESTILOS SIDEBAR
   ========================= */

const panelWrapper = {
  position: 'fixed',
  right: 0,
  top: 0,
  width: 400,
  height: '100vh',
  background: '#020617',
  color: '#e5e7eb',
  borderLeft: '1px solid #1f2937',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 999
};

const panelHeader = {
  padding: 20,
  borderBottom: '1px solid #1f2937',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const panelContent = {
  flex: 1,
  padding: 20,
  overflowY: 'auto'
};

const panelFooter = {
  padding: 16,
  borderTop: '1px solid #1f2937'
};

const closeIcon = {
  background: 'transparent',
  border: 'none',
  color: '#9ca3af',
  fontSize: 18,
  cursor: 'pointer'
};

const primaryBtn = {
  width: '100%',
  padding: 12,
  marginTop: 16,
  background: '#2563eb',
  border: 'none',
  borderRadius: 10,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer'
};

const secondaryBtn = {
  width: '100%',
  padding: 12,
  marginTop: 10,
  background: '#020617',
  border: '1px solid #374151',
  borderRadius: 10,
  color: '#e5e7eb',
  cursor: 'pointer'
};

const approveBtn = {
  ...secondaryBtn,
  color: '#22c55e',
  border: '1px solid #14532d'
};

const footerClose = {
  width: '100%',
  padding: 10,
  background: '#000',
  border: '1px solid #374151',
  color: '#9ca3af',
  borderRadius: 8,
  cursor: 'pointer'
};
