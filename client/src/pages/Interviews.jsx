import { useState, useEffect } from 'react';
import { Calendar, Plus, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' };
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm placeholder-[#4d5566] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]';
const STATUS_PILL = { scheduled: { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff' }, completed: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }, cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' }, no_show: { bg: 'rgba(255,255,255,0.06)', color: '#8d96a0' } };
const TABS = ['all','scheduled','completed','cancelled'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="hover:text-white" style={{ color: '#4d5566' }}><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FeedbackModal({ interview, onClose, onSaved }) {
  const { register, handleSubmit } = useForm({ defaultValues: { feedback: interview.feedback || '', rating: interview.rating || 3, status: interview.status } });
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    try { await api.patch(`/interviews/${interview.id}/feedback`, { ...data, rating: Number(data.rating) }); toast.success('Saved'); onSaved(); onClose(); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  return (
    <Modal title="Interview Feedback" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Status</label>
          <select {...register('status')} className={inputCls} style={inputStyle}>
            {['scheduled','completed','cancelled','no_show'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Rating (1–5)</label>
          <input {...register('rating')} type="number" min="1" max="5" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Feedback</label>
          <textarea {...register('feedback')} rows={4} className={`${inputCls} resize-none`} style={inputStyle} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#8d96a0' }}>Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function ScheduleModal({ onClose, onCreated }) {
  const { register, handleSubmit } = useForm();
  const [applications, setApplications] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    api.get('/applications').then(r => setApplications(r.data)).catch(() => {});
    api.get('/auth/users').then(r => setInterviewers(r.data.filter(u => ['interviewer','admin'].includes(u.role)))).catch(() => {});
  }, []);
  const onSubmit = async (data) => {
    setLoading(true);
    try { const r = await api.post('/interviews', { ...data, scheduledAt: new Date(data.scheduledAt).toISOString() }); toast.success('Scheduled'); onCreated(r.data); onClose(); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  return (
    <Modal title="Schedule Interview" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Application</label>
          <select {...register('applicationId',{required:true})} className={inputCls} style={inputStyle}>
            <option value="">Select application...</option>
            {applications.map(a => <option key={a.id} value={a.id}>{a.candidate?.name} — {a.job?.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Interviewer</label>
          <select {...register('interviewerId',{required:true})} className={inputCls} style={inputStyle}>
            <option value="">Select interviewer...</option>
            {interviewers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Date & Time</label>
          <input {...register('scheduledAt',{required:true})} type="datetime-local" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Type</label>
          <select {...register('type')} className={inputCls} style={inputStyle}>
            {['technical','hr','system_design','behavioral','culture_fit'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#8d96a0' }}>Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>{loading ? 'Scheduling...' : 'Schedule'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Interviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [tab, setTab] = useState('all');
  const [selectedIV, setSelectedIV] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const load = () => { const q = tab !== 'all' ? `?status=${tab}` : ''; api.get(`/interviews${q}`).then(r => setInterviews(r.data)).catch(() => {}); };
  useEffect(() => { load(); }, [tab]);

  const grouped = interviews.reduce((acc, iv) => {
    const date = new Date(iv.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    (acc[date] = acc[date] || []).push(iv); return acc;
  }, {});

  const canEdit = ['admin','recruiter'].includes(user?.role);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Interviews</h1><p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{interviews.length} total</p></div>
        {canEdit && <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}><Plus size={14} /> Schedule</button>}
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
            style={tab === t ? { background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)', color: '#fff' } : { background: '#1c2333', color: '#8d96a0', border: '1px solid rgba(255,255,255,0.07)' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, ivs]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={14} style={{ color: '#4d5566' }} />
              <span className="text-sm font-semibold" style={{ color: '#8d96a0' }}>{date}</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="space-y-2.5">
              {ivs.map(iv => {
                const sp = STATUS_PILL[iv.status] || STATUS_PILL.scheduled;
                return (
                  <div key={iv.id} className="flex items-center justify-between rounded-xl px-5 py-4 hover:bg-white/3 transition-colors" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-5">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-sm font-semibold text-white">{new Date(iv.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <p className="font-medium text-white">{iv.application?.candidate?.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8d96a0' }}>{iv.application?.job?.title} · <span className="capitalize">{iv.type}</span> · {iv.interviewer?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {iv.rating && <div className="flex items-center gap-1"><Star size={13} style={{ color: '#fbbf24', fill: '#fbbf24' }} /><span className="text-sm font-medium text-white">{iv.rating}</span></div>}
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: sp.bg, color: sp.color }}>{iv.status}</span>
                      <button onClick={() => setSelectedIV(iv)} className="text-xs hover:text-white transition-colors" style={{ color: '#58a6ff' }}>Feedback</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && <div className="text-center py-16 text-sm" style={{ color: '#4d5566' }}>No interviews found</div>}
      </div>

      {selectedIV && <FeedbackModal interview={selectedIV} onClose={() => setSelectedIV(null)} onSaved={load} />}
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} onCreated={iv => setInterviews(p => [iv, ...p])} />}
    </div>
  );
}
