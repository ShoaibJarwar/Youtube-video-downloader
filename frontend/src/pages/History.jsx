import { useState, useEffect, useCallback } from 'react';
import { getHistory, deleteHistory } from '../services/api';
import { useApp } from '../context/AppContext';
import HistoryTable from '../components/HistoryTable';
import Loader from '../components/Loader';

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useApp();

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      setRecords(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteHistory(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      addToast('Entry deleted', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }, [addToast]);

  const stats = {
    total: records.length,
    completed: records.filter((r) => r.status === 'completed').length,
    failed: records.filter((r) => r.status === 'failed').length,
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-label">All Downloads</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Download History</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['Total', stats.total], ['Completed', stats.completed], ['Failed', stats.failed]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="yt-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 64, display: 'flex', justifyContent: 'center' }}>
            <Loader label="Loading history..." />
          </div>
        ) : (
          <HistoryTable records={records} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
