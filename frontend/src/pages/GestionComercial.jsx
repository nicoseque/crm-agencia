import { useEffect, useMemo, useState } from 'react';
import {
  getCommercialVendors,
  getStaleQuotesBySeller
} from '../services/commercial.service';
import StaleQuotesModal from '../components/commercial/StaleQuotesModal';

function getMonthInfo(date = new Date()) {
  const day = date.getDate();
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  return {
    day,
    daysInMonth
  };
}

function formatMonthLabel(value) {
  const [y, m] = value.split('-');
  return new Date(y, m - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  });
}

function getLastMonths(count = 6) {
  const months = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    );
  }

  return months;
}

function GestionComercial() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');

  const [topProduct, setTopProduct] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [staleQuotes, setStaleQuotes] = useState([]);

  const isCurrentMonth =
    !selectedMonth ||
    selectedMonth ===
      `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, '0')}`;

  const monthDate = selectedMonth
    ? new Date(`${selectedMonth}-01`)
    : new Date();

  const { day, daysInMonth } = getMonthInfo(monthDate);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCommercialVendors(
          selectedMonth || undefined
        );

        const rows = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setVendors(rows);
      } catch (e) {
        console.error('Error cargando gestión comercial', e);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedMonth]);

  useEffect(() => {
    const query = selectedMonth ? `?month=${selectedMonth}` : '';

    fetch(
      `${import.meta.env.VITE_API_URL}/metrics/top-products${query}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTopProduct(data[0]);
        } else {
          setTopProduct(null);
        }
      })
      .catch(() => setTopProduct(null));
  }, [selectedMonth]);

  const openStaleQuotes = async (vendor) => {
    try {
      const res = await getStaleQuotesBySeller(vendor.seller_id);
      setSelectedSeller(vendor);
      setStaleQuotes(Array.isArray(res) ? res : []);
      setModalOpen(true);
    } catch {
      /* noop */
    }
  };

  const enriched = useMemo(() => {
    return vendors.map(v => {
      const totalPlans = Number(v.approved_quotes) || 0;
      const target = Number(v.monthly_target) || 0;

      const progress =
        target > 0
          ? Math.round((totalPlans / target) * 100)
          : 0;

      const projected = isCurrentMonth && day > 0
        ? Math.round((totalPlans / day) * daysInMonth)
        : totalPlans;

      const remaining = target > 0
        ? Math.max(target - totalPlans, 0)
        : 0;

      let state = '🟢';
      let rowColor = '#ecfdf5';
      let alertText = 'En ritmo';

      if (target > 0) {
        if (projected < target * 0.9) {
          state = '🔴';
          rowColor = '#fef2f2';
          alertText = 'No llega';
        } else if (projected < target) {
          state = '🟡';
          rowColor = '#fffbeb';
          alertText = 'Justo';
        }
      } else {
        state = '⚪';
        rowColor = '#f9fafb';
        alertText = 'Sin objetivo';
      }

      if (!isCurrentMonth) {
        alertText = 'Mes cerrado';
      }

      return {
        ...v,
        totalPlans,
        progress: isCurrentMonth ? progress : 100,
        projected,
        remaining,
        state,
        rowColor,
        alertText
      };
    });
  }, [vendors, day, daysInMonth, isCurrentMonth]);

  if (loading) return <p>Cargando gestión comercial…</p>;

  return (
    <>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 24
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            Gestión Comercial
          </h1>

          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '6px 10px'
            }}
          >
            <option value="">Mes actual</option>
            {getLastMonths(6).map(m => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: 'left',
                fontSize: 13,
                color: '#6b7280',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <th style={{ padding: '12px 8px' }}>Vendedor</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>
                Producción
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>
                Avance
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>
                Vencidos
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>
                Faltante
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>
                Proyección
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {enriched.map(v => (
              <tr
                key={v.seller_id}
                style={{
                  background: v.rowColor,
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <td style={{ padding: '14px 8px', fontWeight: 700 }}>
                  <span style={{ marginRight: 6 }}>{v.state}</span>
                  {v.seller_name}
                </td>

                <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                  {v.totalPlans} planes
                </td>

                <td style={{ textAlign: 'center', fontWeight: 800 }}>
                  {v.progress}%
                </td>

                <td style={{ textAlign: 'center', fontWeight: 800 }}>
                  {v.stale_quotes || 0}
                </td>

                <td style={{ textAlign: 'right' }}>
                  {v.remaining}
                </td>

                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                  {v.projected}
                </td>

                <td style={{ textAlign: 'center', fontWeight: 700 }}>
                  {v.alertText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {topProduct && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #e5e7eb',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            🏆 Modelo más vendido del mes:{' '}
            <strong>{topProduct.product}</strong>{' '}
            ({topProduct.total_aprobados} aprobados)
          </div>
        )}
      </div>

      <StaleQuotesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sellerName={selectedSeller?.seller_name}
        quotes={staleQuotes}
      />
    </>
  );
}

export default GestionComercial;