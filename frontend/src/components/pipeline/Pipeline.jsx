import { useState } from 'react';
import PipelineColumn from './PipelineColumn';

function Pipeline({
  columns,
  onSelectLead,
  onDropLead,
  forceShowExpired // 👈 NUEVO (viene del Dashboard)
}) {
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  // Si el Dashboard fuerza el filtro, tiene prioridad
  const activeFilter =
    typeof forceShowExpired === 'boolean'
      ? forceShowExpired
      : showExpiredOnly;

  // ---------- FILTRO DE LEADS ----------
  const filterLeads = (leads = []) => {
    if (!activeFilter) return leads;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return leads.filter(lead => {
      if (!lead.created_at) return false;
      if (lead.status === 'APROBADO' || lead.status === 'CANCELADO')
        return false;

      const created = new Date(lead.created_at);
      created.setHours(0, 0, 0, 0);

      const diffDays =
        (today - created) / (1000 * 60 * 60 * 24);

      return diffDays >= 3;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        marginTop: 24,
        paddingBottom: 24,
        overflowX: 'auto'
      }}
    >
      {columns.map(col => (
        <PipelineColumn
          key={col.id}
          title={col.name}
          status={col.status}
          leads={filterLeads(col.leads)} // 👈 APLICA FILTRO
          onSelect={onSelectLead}
          onDropLead={onDropLead}
        />
      ))}
    </div>
  );
}

export default Pipeline;
