import { useEffect, useState } from 'react';
import { getQuoteHistory } from '../../services/quotes.service';

function QuoteHistory({ quoteId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!quoteId) return;

    getQuoteHistory(quoteId)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [quoteId]);

  if (!history.length) {
    return <p style={{ fontSize: 13 }}>Sin historial</p>;
  }

  return (
    <div style={{ marginTop: 10 }}>
      <h4>Historial</h4>

      <ul style={{ fontSize: 13, paddingLeft: 16 }}>
        {history.map(item => (
          <li key={item.id} style={{ marginBottom: 6 }}>
            <strong>{item.user_name}</strong>{' '}
            → {item.new_status}{' '}
            <span style={{ color: '#666' }}>
              ({new Date(item.created_at).toLocaleString()})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuoteHistory;
