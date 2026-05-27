import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const EXAMPLES = ['React developers with 5+ years experience', 'Candidates from LinkedIn in New York', 'Engineers with AWS and Kubernetes skills', 'Data scientists with Python and ML'];
const STATUS_PILL = { applied: { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff' }, screening: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }, interview: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' }, offer: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' }, hired: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' }, rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' } };

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    try { const r = await api.post('/ai/search', { query: q }); setResults(r.data.results); }
    catch { toast.error('Search failed'); setResults([]); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">AI Search</h1>
        <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>Natural language candidate search powered by AI</p>
      </div>

      <div className="rounded-xl p-6" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Sparkles size={15} className="absolute left-3.5 top-3" style={{ color: '#a78bfa' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Ask anything about your candidates..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
              style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' }} />
          </div>
          <button onClick={() => search()} disabled={loading || !query.trim()} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            <Search size={15} />{loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs mb-2" style={{ color: '#4d5566' }}>Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(e => (
              <button key={e} onClick={() => { setQuery(e); search(e); }} className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/8"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {searched && (
        <div>
          <p className="text-xs mb-3" style={{ color: '#4d5566' }}>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.length === 0
            ? <div className="rounded-xl p-12 text-center text-sm" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#4d5566' }}>No candidates matched your query</div>
            : (
              <div className="rounded-xl overflow-hidden" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Name', 'Role', 'Skills', 'Experience', 'Location', 'Source'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4d5566' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((c, i) => {
                      const st = c.applications?.[0]?.status || 'applied';
                      const sp = STATUS_PILL[st] || STATUS_PILL.applied;
                      return (
                        <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <td className="px-4 py-3.5"><Link to={`/candidates/${c.id}`} className="font-medium text-white hover:text-[#58a6ff]">{c.name}</Link><p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{c.email}</p></td>
                          <td className="px-4 py-3.5 text-sm" style={{ color: '#8d96a0' }}>{c.currentRole || '—'}</td>
                          <td className="px-4 py-3.5"><div className="flex flex-wrap gap-1">{c.skills?.slice(0,3).map(s => <span key={s} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>{s}</span>)}</div></td>
                          <td className="px-4 py-3.5 text-sm" style={{ color: '#8d96a0' }}>{c.experience ? `${c.experience}y` : '—'}</td>
                          <td className="px-4 py-3.5 text-sm" style={{ color: '#8d96a0' }}>{c.location || '—'}</td>
                          <td className="px-4 py-3.5 text-sm" style={{ color: '#8d96a0' }}>{c.source || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
