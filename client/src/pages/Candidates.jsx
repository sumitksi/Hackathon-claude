import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, GitCompare, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
const STATUS_PILL = {
  applied:   { bg: 'rgba(88,166,255,0.12)',  color: '#58a6ff' },
  screening: { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf' },
  interview: { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa' },
  offer:     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  hired:     { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
};

const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' };
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm placeholder-[#4d5566] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl max-h-[90vh] overflow-y-auto" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="hover:text-white transition-colors" style={{ color: '#4d5566' }}><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function AddCandidateModal({ onClose, onCreated }) {
  const { register, handleSubmit } = useForm();
  const [duplicates, setDuplicates] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/candidates', { ...data, skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [] });
      toast.success('Candidate added'); onCreated(res.data); onClose();
    } catch (err) {
      if (err.response?.status === 409) setDuplicates(err.response.data.duplicates);
      else toast.error('Failed');
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Candidate" onClose={onClose}>
      {duplicates && (
        <div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
          <div><p className="text-xs font-medium" style={{ color: '#fbbf24' }}>Potential Duplicates</p>{duplicates.map(d => <p key={d.id} className="text-xs mt-1" style={{ color: '#8d96a0' }}>{d.name} · {d.email}</p>)}</div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {[['name','Full Name','text',true],['email','Email','email',true],['phone','Phone','text',false],['currentRole','Current Role','text',false],['location','Location','text',false]].map(([f,l,t,req]) => (
          <div key={f}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>{l}</label>
            <input {...register(f,{required:req})} type={t} className={inputCls} style={inputStyle} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Skills (comma-separated)</label>
          <input {...register('skills')} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Source</label>
          <select {...register('source')} className={inputCls} style={inputStyle}>
            {['LinkedIn','Indeed','Referral','GitHub','Conference','Portfolio','Other'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: '#8d96a0' }}>Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>{loading ? 'Adding...' : 'Add Candidate'}</button>
        </div>
      </form>
    </Modal>
  );
}

function CompareModal({ ids, onClose }) {
  const [candidates, setCandidates] = useState([]);
  useEffect(() => { api.post('/candidates/compare', { ids }).then(r => setCandidates(r.data)).catch(() => {}); }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl max-h-[90vh] overflow-y-auto" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">Compare Candidates</h2>
          <button onClick={onClose} style={{ color: '#4d5566' }}><X size={18} /></button>
        </div>
        <div className="p-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
          {candidates.map(c => c && (
            <div key={c.id} className="rounded-lg p-4" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-semibold text-white">{c.name}</p>
              <p className="text-xs mt-0.5 mb-3" style={{ color: '#8d96a0' }}>{c.currentRole}</p>
              {[['Experience', c.experience ? `${c.experience}y` : '—'], ['Location', c.location || '—'], ['Source', c.source || '—']].map(([l,v]) => (
                <div key={l} className="flex justify-between text-xs py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#4d5566' }}>{l}</span><span style={{ color: '#f0f6fc' }}>{v}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-1 mt-3">{c.skills?.map(s => <span key={s} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>{s}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Candidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');
  const [showAdd, setShowAdd] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (q = '') => {
    setLoading(true);
    try { const r = await api.get(`/candidates?search=${q}&limit=50`); setCandidates(r.data.candidates); setTotal(r.data.total); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(search); }, [search]);

  const toggleCompare = id => setCompareIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p);

  const handleDrop = async (candidateId, status) => {
    const apps = candidates.find(c => c.id === candidateId)?.applications;
    if (!apps?.length) return;
    try { await api.patch(`/applications/${apps[0].id}/status`, { status }); load(search); toast.success(`Moved to ${status}`); } catch {}
  };

  const canEdit = ['admin', 'recruiter'].includes(user?.role);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Candidates</h1>
          <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{total} total</p>
        </div>
        <div className="flex items-center gap-2">
          {compareIds.length >= 2 && (
            <button onClick={() => setShowCompare(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
              <GitCompare size={14} /> Compare ({compareIds.length})
            </button>
          )}
          <button onClick={() => setView(v => v === 'table' ? 'kanban' : 'table')} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#8d96a0' }}>
            {view === 'table' ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          {canEdit && <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}><Plus size={14} /> Add Candidate</button>}
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-2.5" style={{ color: '#4d5566' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f6feb]"
          style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#f0f6fc' }} />
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: '#4d5566' }}>Loading...</div>
      ) : view === 'table' ? (
        <div className="rounded-xl overflow-hidden" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['', 'Name', 'Role', 'Skills', 'Exp', 'Source', 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4d5566' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => {
                const st = c.applications?.[0]?.status || 'applied';
                const p = STATUS_PILL[st] || STATUS_PILL.applied;
                return (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: i < candidates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className="px-4 py-3"><input type="checkbox" checked={compareIds.includes(c.id)} onChange={() => toggleCompare(c.id)} className="accent-[#1f6feb] w-3.5 h-3.5" /></td>
                    <td className="px-4 py-3"><Link to={`/candidates/${c.id}`} className="font-medium text-white hover:text-[#58a6ff] transition-colors">{c.name}</Link><p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{c.email}</p></td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8d96a0' }}>{c.currentRole || '—'}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{c.skills?.slice(0, 2).map(s => <span key={s} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>{s}</span>)}{c.skills?.length > 2 && <span className="text-xs" style={{ color: '#4d5566' }}>+{c.skills.length - 2}</span>}</div></td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8d96a0' }}>{c.experience ? `${c.experience}y` : '—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8d96a0' }}>{c.source || '—'}</td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: p.bg, color: p.color }}>{st}</span></td>
                    <td className="px-4 py-3"><Link to={`/candidates/${c.id}`} className="text-xs hover:text-white transition-colors" style={{ color: '#58a6ff' }}>View</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATUSES.map(status => {
            const p = STATUS_PILL[status];
            return (
              <div key={status} className="rounded-xl p-3 min-h-64" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}
                onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleDrop(e.dataTransfer.getData('candidateId'), status); }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: p.color }}>{status}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: p.bg, color: p.color }}>{candidates.filter(c => c.applications?.[0]?.status === status).length}</span>
                </div>
                <div className="space-y-2">
                  {candidates.filter(c => c.applications?.[0]?.status === status).map(c => (
                    <div key={c.id} draggable onDragStart={e => e.dataTransfer.setData('candidateId', c.id)}
                      className="p-2.5 rounded-lg cursor-grab hover:bg-white/5 transition-colors" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Link to={`/candidates/${c.id}`} className="text-xs font-medium text-white hover:text-[#58a6ff]">{c.name}</Link>
                      <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{c.currentRole || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddCandidateModal onClose={() => setShowAdd(false)} onCreated={() => load(search)} />}
      {showCompare && <CompareModal ids={compareIds} onClose={() => setShowCompare(false)} />}
    </div>
  );
}
