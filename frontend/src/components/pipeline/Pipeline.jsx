import { useState } from 'react';
import PipelineColumn from './PipelineColumn';

function Pipeline({
  columns,
  onSelectLead,
  onDropLead,
  onRequestApprove, // 👈 NUEVO
  forceShowExpired
}) {
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  const activeFilter =
    typeof forceShowExpired === 'boolean'
      ? forceShowExpired
      : showExpiredOnly;

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

  const handleDrop = (lead, newStatus) => {
    // 🔥 SI SE SUELTA EN APROBADO → NO CAMBIAMOS STATUS
    if (newStatus === 'APROBADO') {
      onRequestApprove?.(lead);
      return;
    }

    // 👉 resto de estados normal
    onDropLead?.(lead.id, newStatus);
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
          leads={filterLeads(col.leads)}
          onSelect={onSelectLead}
          onDropLead={handleDrop} // 👈 USAMOS EL HANDLER
        />
      ))}
    </div>
  );
}

export default Pipeline;
