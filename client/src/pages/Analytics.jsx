import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#58a6ff', '#2dd4bf', '#a78bfa', '#fbbf24', '#4ade80', '#f87171'];

const darkTooltip = {
  contentStyle: { background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f6fc' },
  labelStyle: { color: '#8d96a0' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

function Card({ title, children }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#4d5566' }}>{title}</p>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState({ funnel: [], recruiters: [], sourceROI: [], timeToHire: [], department: [], offerAcceptance: {}, scorecard: [], health: {} });

  useEffect(() => {
    Promise.all([
      api.get('/analytics/funnel'), api.get('/analytics/recruiters'), api.get('/analytics/source-roi'),
      api.get('/analytics/time-to-hire'), api.get('/analytics/department'), api.get('/analytics/offer-acceptance'),
      api.get('/analytics/interviewer-scorecard'), api.get('/analytics/health-score'),
    ]).then(([f, r, s, t, d, o, sc, h]) => {
      setData({ funnel: f.data, recruiters: r.data, sourceROI: s.data, timeToHire: t.data, department: d.data, offerAcceptance: o.data, scorecard: sc.data, health: h.data });
    }).catch(() => {});
  }, []);

  const exportCSV = (d, name) => {
    if (!d.length) return;
    const k = Object.keys(d[0]);
    const csv = [k.join(','), ...d.map(r => k.map(x => r[x]).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${name}.csv`; a.click();
  };

  const axisStyle = { fill: '#4d5566', fontSize: 11 };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Analytics</h1><p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>Recruitment performance insights</p></div>
        <button onClick={() => exportCSV(data.funnel, 'funnel')} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)', color: '#8d96a0' }}><Download size={14} /> Export</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Pipeline Funnel">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.funnel}>
              <XAxis dataKey="status" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {data.funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Recruiter Performance">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.recruiters}>
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltip} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8d96a0' }} />
              <Bar dataKey="applications" fill="#58a6ff" radius={[4,4,0,0]} />
              <Bar dataKey="hired" fill="#2dd4bf" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Candidate Source ROI">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.sourceROI} dataKey="total" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({ source, percent }) => `${source} ${(percent*100).toFixed(0)}%`} labelLine={{ stroke: '#4d5566' }}>
                {data.sourceROI.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...darkTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Time to Hire by Department (avg days)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.timeToHire} layout="vertical">
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="department" type="category" tick={axisStyle} width={90} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="avgDays" fill="#fbbf24" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Applications by Department">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.department} dataKey="count" nameKey="department" cx="50%" cy="50%" innerRadius={45} outerRadius={80}>
                {data.department.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...darkTooltip} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8d96a0' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Offer Acceptance">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: '#2dd4bf' }}>{data.offerAcceptance.acceptanceRate || 0}%</div>
              <div className="text-xs mt-1" style={{ color: '#4d5566' }}>Acceptance Rate</div>
            </div>
            <div className="grid grid-cols-3 gap-5 flex-1">
              {[['Offers', data.offerAcceptance.offers, '#fbbf24'], ['Hired', data.offerAcceptance.hired, '#4ade80'], ['Rejected', data.offerAcceptance.rejected, '#f87171']].map(([l, v, c]) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: c }}>{v || 0}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Interviewer Scorecards">
          <div className="space-y-3">
            {data.scorecard.map(s => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="text-sm font-medium text-white w-32 shrink-0 truncate">{s.name}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${(s.avgRating / 5) * 100}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }} />
                </div>
                <span className="text-xs font-medium w-10 text-right" style={{ color: '#fbbf24' }}>{s.avgRating}/5</span>
                <span className="text-xs w-16 text-right" style={{ color: '#4d5566' }}>{s.total} reviews</span>
              </div>
            ))}
            {data.scorecard.length === 0 && <p className="text-sm" style={{ color: '#4d5566' }}>No data yet</p>}
          </div>
        </Card>

        <Card title="Pipeline Health Score">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold" style={{ color: '#58a6ff' }}>{data.health.score || 0}</div>
              <div className="text-xs mt-1" style={{ color: '#4d5566' }}>Overall Score</div>
            </div>
            <div className="space-y-2.5">
              {[['Open Positions', data.health.open, '#58a6ff'], ['Hired', data.health.hired, '#4ade80'], ['Total Apps', data.health.total, '#8d96a0']].map(([l, v, c]) => (
                <div key={l} className="flex items-center gap-3">
                  <span className="text-xl font-bold" style={{ color: c }}>{v || 0}</span>
                  <span className="text-sm" style={{ color: '#4d5566' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
