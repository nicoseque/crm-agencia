import { useEffect, useMemo, useState } from 'react';
import {
  getCommercialVendors,
  getStaleQuotesBySeller
} from '../services/commercial.service';
import StaleQuotesModal from '../components/commercial/StaleQuotesModal';

/* 🎯 OBJETIVO FIJO */
const MONTHLY_OBJECTIVE = 2_500_000;

function getMonthInfo() {
  const now = new Date();
  const day = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  return {
    day,
    daysInMonth,
    progressPct: Math.round((day / daysInMonth) * 100)
  };
}

function GestionComercial() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* MODAL VENCIDOS */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [staleQuotes, setStaleQuotes] = useState([]);

  const { day, daysInMonth, progressPct } = getMonthInfo();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCommercialVendors();
        setVendors(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error cargando gestión comercial', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openStaleQuotes = async (vendor) => {
    try {
      const data = await getStaleQuotesBySeller(vendor.seller_id);
      setSelectedSeller(vendor);
      setStaleQuotes(Array.isArray(data) ? data : []);
      setModalOpen(true);
    } catch (e) {
      console.error('Error cargando presupuestos vencidos', e);
    }
  };

  const enriched = useMemo(() => {
    return vendors.map(v => {
      const progress =
        MONTHLY_OBJECTIVE > 0
          ? Math.round((v.total_amount / MONTHLY_OBJECTIVE) * 100)
          : 0;

      const projected =
        day > 0
          ? Math.round((v.total_amount / day) * daysInMonth)
          : 0;

      const remaining = Math.max(
        MONTHLY_OBJECTIVE - v.total_amount,
        0
      );

      let state = '🟢';
      let rowColor = '#ecfdf5';
      let alertText = 'En ritmo';

      if (projected < MONTHLY_OBJECTIVE * 0.9) {
        state = '🔴';
        rowColor = '#fef2f2';
        alertText = 'No llega';
      } else if (projected < MONTHLY_OBJECTIVE) {
        state = '🟡';
        rowColor = '#fffbeb';
        alertText = 'Justo';
      }

      return {
        ...v,
        progress,
        projected,
        remaining,
        state,
        rowColor,
        alertText
      };
    });
  }, [vendors, day, daysInMonth]);

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
        {/* HEADER */}
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
          Gestión Comercial
        </h1>

        <div
          style={{
            fontSize: 13,
            color: '#6b7280',
            marginBottom: 20
          }}
        >
          Objetivo mensual por vendedor:{' '}
          <strong>
            $ {MONTHLY_OBJECTIVE.toLocaleString('es-AR')}
          </strong>{' '}
          · Avance del mes:{' '}
          <strong>{progressPct}%</strong>
        </div>

        {/* TABLE */}
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
                {/* VENDEDOR */}
                <td style={{ padding: '14px 8px', fontWeight: 700 }}>
                  <span style={{ marginRight: 6 }}>{v.state}</span>
                  {v.seller_name}
                </td>

                {/* PRODUCCIÓN */}
                <td
                  style={{
                    padding: '14px 8px',
                    textAlign: 'right',
                    fontWeight: 600
                  }}
                >
                  $ {Number(v.total_amount).toLocaleString('es-AR')}
                </td>

                {/* AVANCE */}
                <td
                  style={{
                    padding: '14px 8px',
                    textAlign: 'center',
                    fontWeight: 800,
                    color:
                      v.progress >= progressPct
                        ? '#16a34a'
                        : '#dc2626'
                  }}
                >
                  {v.progress}%
                </td>

                {/* VENCIDOS */}
                <td style={{ textAlign: 'center', fontWeight: 800 }}>
                  {v.stale_quotes > 0 ? (
                    <button
                      onClick={() => openStaleQuotes(v)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                    >
                      {v.stale_quotes}
                    </button>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>0</span>
                  )}
                </td>

                {/* FALTANTE */}
                <td
                  style={{
                    padding: '14px 8px',
                    textAlign: 'right'
                  }}
                >
                  $ {Number(v.remaining).toLocaleString('es-AR')}
                </td>

                {/* PROYECCIÓN */}
                <td
                  style={{
                    padding: '14px 8px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color:
                      v.projected >= MONTHLY_OBJECTIVE
                        ? '#16a34a'
                        : '#dc2626'
                  }}
                >
                  $ {Number(v.projected).toLocaleString('es-AR')}
                </td>

                {/* ESTADO */}
                <td
                  style={{
                    padding: '14px 8px',
                    textAlign: 'center',
                    fontWeight: 700
                  }}
                >
                  {v.alertText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
