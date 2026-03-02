import PipelineCard from './PipelineCard';

function PipelineColumn({ title, leads = [], onSelect, status, onDropLead }) {
  const sortedLeads = [...leads].sort((a, b) => {
    if (!a.created_at) return 1;
    if (!b.created_at) return -1;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();

    // 🔑 SIEMPRE text/plain
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const lead = leads.find(l => String(l.id) === String(leadId));
    if (!lead) return;

    // 👉 delegamos la lógica al Pipeline
    onDropLead(lead, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: 300,
        maxHeight: '65vh',
        background: '#f9fafb',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
          {title}
        </div>

        <span
          style={{
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 999,
            background: '#e5e7eb',
            color: '#374151',
            fontWeight: 600
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* CARDS */}
<div style={{ overflowY: 'auto', paddingRight: 4 }}>
  {sortedLeads.map((lead) => (
    <PipelineCard
      key={lead.id}
      id={lead.id}
      name={lead.client_name}
      product={
        lead.product ||
        lead.interest_type ||
        lead.description ||
        '—'
      }
      sellerName={lead.seller_name}
      createdAt={lead.created_at}
      status={status}
      onClick={() => onSelect(lead)}
    />
  ))}
</div>    
</div>
  );
}

export default PipelineColumn;
