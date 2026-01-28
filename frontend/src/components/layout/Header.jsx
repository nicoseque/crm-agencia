import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

function Header() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // endpoint simple, puede ser /company/me o similar
    // si todavía no existe, lo ajustamos
    apiFetch('/users/me')
      .then(res => setCompany(res.company))
      .catch(() => setCompany(null));
  }, []);

  return (
    <header
      style={{
        height: 64,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        background: '#fff'
      }}
    >
      {company?.logo_url && (
        <img
          src={company.logo_url}
          alt="Logo empresa"
          style={{ height: 40 }}
        />
      )}

      <h2 style={{ margin: 0 }}>
        {company?.name || 'Dashboard'}
      </h2>
    </header>
  );
}

export default Header;
