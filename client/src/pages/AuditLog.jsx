import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const ENTITY_TYPES = ['all','Candidate','Application','Interview','JobOpening'];
const ACTION_PILL = {
  CREATE:        { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf' },
  UPDATE:        { bg: 'rgba(88,166,255,0.12)',  color: '#58a6ff' },
  DELETE:        { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
  STATUS_CHANGE: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  SCHEDULE:      { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa' },
  FEEDBACK:      { bg: 'rgba(88,166,255,0.12)',  color: '#58a6ff' },
  UPLOAD_RESUME: { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf' },
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 50 });
    if (search) p.append('search', search);
    if (entity !== 'all') p.append('entity', entity);
    api.get(`/audit?${p}`).then(r => { setLogs(r.data.logs); setTotal(r.data.total); setPages(r.data.pages); }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, entity]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Audit Log</h1>
        <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{total} total entries</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-2.5" style={{ color: '#4d5566' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search actions..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f6feb]"
            style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#f0f6fc' }} />
        </div>
        <select value={entity} onChange={e => { setEntity(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1f6feb]"
          style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#8d96a0' }}>
          {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? <div className="text-center py-16 text-sm" style={{ color: '#4d5566' }}>Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Time','User','Action','Entity','Entity ID','Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4d5566' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const ap = ACTION_PILL[log.action] || { bg: 'rgba(255,255,255,0.06)', color: '#8d96a0' };
                return (
                  <tr key={log.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#4d5566' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><p className="text-sm font-medium text-white">{log.user?.name}</p><p className="text-xs capitalize" style={{ color: '#4d5566' }}>{log.user?.role}</p></td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: ap.bg, color: ap.color }}>{log.action}</span></td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8d96a0' }}>{log.entity}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: '#4d5566' }}>{log.entityId?.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#4d5566' }}>{log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}</td>
                  </tr>
                );
              })}
              {logs.length === 0 && <tr><td colSpan={6} className="text-center py-16 text-sm" style={{ color: '#4d5566' }}>No logs found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: '#4d5566' }}>Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded-lg transition-colors disabled:opacity-30 hover:bg-white/5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#8d96a0' }}><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages} className="p-1.5 rounded-lg transition-colors disabled:opacity-30 hover:bg-white/5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#8d96a0' }}><ChevronRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
