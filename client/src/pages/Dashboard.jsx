import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Users, Briefcase, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import api from '../services/api';

function formatActivity(a) {
  const { action, entity, details } = a;
  if (action === 'STATUS_CHANGE' && details?.candidateName)
    return `moved ${details.candidateName} from ${details.from} → ${details.to}`;
  if (action === 'CREATE' && entity === 'Candidate') return `added candidate ${details?.name || ''}`;
  if (action === 'CREATE' && entity === 'JobOpening') return `posted job: ${details?.title || ''}`;
  if (action === 'CREATE' && entity === 'Interview') return `scheduled an interview`;
  if (action === 'DELETE') return `deleted a ${entity.toLowerCase()}`;
  if (action === 'UPLOAD_RESUME') return `uploaded a resume`;
  if (action === 'FEEDBACK') return `submitted feedback (${details?.rating}/5)`;
  return `${action.toLowerCase().replace(/_/g, ' ')} · ${entity.toLowerCase()}`;
}

const STATUS_PILL = {
  applied: { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff' },
  screening: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' },
  interview: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
  offer: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  hired: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

function StatCard({ title, value, icon: Icon, color, delta }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#4d5566' }}>{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {delta && <p className="text-xs mt-1.5" style={{ color: '#2dd4bf' }}>↑ {delta}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + '22' }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function HealthScoreWidget({ score }) {
  const r = 52, c = 2 * Math.PI * r, dash = (score / 100) * c;
  const color = score >= 70 ? '#2dd4bf' : score >= 40 ? '#fbbf24' : '#f87171';
  return (
    <div className="rounded-xl p-5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: '#4d5566' }}>Pipeline Health</p>
      <div className="flex items-center gap-5">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
          <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>{score}</text>
        </svg>
        <div>
          <p className="text-2xl font-bold text-white">{score >= 70 ? 'Healthy' : score >= 40 ? 'Fair' : 'Critical'}</p>
          <p className="text-sm mt-1" style={{ color: '#8d96a0' }}>Pipeline status</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [health, setHealth] = useState({ score: 0 });
  const [activity, setActivity] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/health-score'),
      api.get('/audit/activity'),
      api.get('/candidates?limit=6'),
    ]).then(([s, h, a, c]) => {
      setStats(s.data); setHealth(h.data); setActivity(a.data); setCandidates(c.data.candidates);
    }).catch(() => {});

    const socket = io('http://localhost:5000');
    socket.on('new_activity', d => setActivity(p => [d, ...p].slice(0, 10)));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8d96a0' }}>Track your recruitment performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Candidates" value={stats.totalCandidates || 0} icon={Users} color="#58a6ff" delta="All time" />
        <StatCard title="Open Jobs" value={stats.totalJobs || 0} icon={Briefcase} color="#2dd4bf" />
        <StatCard title="Applications" value={stats.totalApplications || 0} icon={TrendingUp} color="#a78bfa" />
        <StatCard title="Interviews" value={stats.totalInterviews || 0} icon={Calendar} color="#fbbf24" />
        <StatCard title="Hired / Month" value={stats.hiredThisMonth || 0} icon={UserCheck} color="#4ade80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <HealthScoreWidget score={health.score} />

        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: '#4d5566' }}>Live Activity Feed</p>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {activity.length === 0
              ? <p className="text-sm" style={{ color: '#4d5566' }}>No activity yet</p>
              : activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#2dd4bf' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate"><span className="font-medium text-white">{a.user?.name}</span> <span style={{ color: '#8d96a0' }}>{formatActivity(a)}</span></p>
                    <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{new Date(a.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-semibold text-white">Recent Candidates</p>
          <Link to="/candidates" className="text-xs hover:text-white transition-colors" style={{ color: '#58a6ff' }}>View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Name', 'Role', 'Skills', 'Source', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4d5566' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: i < candidates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-3.5">
                    <Link to={`/candidates/${c.id}`} className="font-medium text-white hover:text-[#58a6ff] transition-colors">{c.name}</Link>
                    <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#8d96a0' }}>{c.currentRole || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.skills?.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#8d96a0' }}>{c.source || '—'}</td>
                  <td className="px-5 py-3.5">
                    {(() => { const st = c.applications?.[0]?.status || 'applied'; const p = STATUS_PILL[st] || STATUS_PILL.applied; return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: p.bg, color: p.color }}>{st}</span>; })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
