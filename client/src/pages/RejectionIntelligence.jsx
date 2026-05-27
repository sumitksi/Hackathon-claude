import { useState } from 'react';
import { Brain, TrendingDown, AlertTriangle, Lightbulb, RefreshCw, Users } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SEVERITY_STYLE = {
  high:   { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  medium: { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  low:    { bg: 'rgba(45,212,191,0.1)',  color: '#2dd4bf', border: 'rgba(45,212,191,0.25)' },
};

function PatternCard({ pattern, index }) {
  const sev = SEVERITY_STYLE[pattern.severity] || SEVERITY_STYLE.medium;
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl font-black shrink-0 w-7" style={{ color: '#30363d' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-snug">{pattern.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#8d96a0' }}>
              {pattern.affectedRole} · {pattern.stage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
            {pattern.severity}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Users size={10} style={{ color: '#4d5566' }} />
            <span className="text-xs font-semibold text-white">{pattern.count}</span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: '#8d96a0' }}>{pattern.insight}</p>

      <div className="flex items-start gap-2 rounded-lg px-3 py-2.5"
        style={{ background: 'rgba(31,111,235,0.08)', border: '1px solid rgba(31,111,235,0.2)' }}>
        <Lightbulb size={13} className="shrink-0 mt-0.5" style={{ color: '#58a6ff' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#58a6ff' }}>{pattern.recommendation}</p>
      </div>
    </div>
  );
}

export default function RejectionIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const r = await api.get('/ai/rejection-patterns');
      setData(r.data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const high   = data?.patterns?.filter(p => p.severity === 'high').length ?? 0;
  const medium = data?.patterns?.filter(p => p.severity === 'medium').length ?? 0;
  const low    = data?.patterns?.filter(p => p.severity === 'low').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingDown size={20} style={{ color: '#f87171' }} />
            Rejection Intelligence
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8d96a0' }}>
            AI-powered pattern analysis across all rejected candidates
          </p>
        </div>
        <button onClick={analyze} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Analyzing…</>
            : <><Brain size={14} /> {data ? 'Re-analyze' : 'Run Analysis'}</>}
        </button>
      </div>

      {/* Empty / idle state */}
      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Brain size={40} style={{ color: '#30363d' }} />
          <p className="text-sm font-medium mt-4 text-white">No analysis yet</p>
          <p className="text-xs mt-1" style={{ color: '#4d5566' }}>
            Click "Run Analysis" to surface rejection patterns with Claude AI
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-5 animate-pulse h-36"
              style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Rejected', value: data.total, color: '#f0f6fc' },
              { label: 'High Severity', value: high,   color: '#f87171' },
              { label: 'Medium Severity', value: medium, color: '#fbbf24' },
              { label: 'Low Severity',  value: low,    color: '#2dd4bf' },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-5 py-4"
                style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: '#4d5566' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="rounded-xl px-5 py-4 flex items-start gap-3"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
              <p className="text-sm leading-relaxed" style={{ color: '#c4b5fd' }}>{data.summary}</p>
            </div>
          )}

          {/* Pattern cards */}
          {data.patterns?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.patterns.map((p, i) => <PatternCard key={i} pattern={p} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-10 rounded-xl"
              style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm text-white">No patterns detected</p>
              <p className="text-xs mt-1" style={{ color: '#4d5566' }}>
                Not enough rejected applications with feedback to find patterns yet.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
