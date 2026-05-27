import { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, Users, Wand2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' };
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm placeholder-[#4d5566] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]';
const STATUS_PILL = { open: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }, closed: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' }, on_hold: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' } };

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-xl max-h-[90vh] overflow-y-auto`} style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="hover:text-white" style={{ color: '#4d5566' }}><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function JDGeneratorModal({ onClose, onApply }) {
  const [form, setForm] = useState({ title: '', department: '', requirements: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await api.post('/ai/generate-jd', { ...form, requirements: form.requirements.split(',').map(s => s.trim()) });
      setResult(r.data.description);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <Modal title="AI Job Description Generator" onClose={onClose} wide>
      <div className="space-y-3.5">
        {[['title','Job Title'],['department','Department'],['requirements','Key Requirements (comma-separated)']].map(([k,l]) => (
          <div key={k}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>{l}</label>
            <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
        ))}
        <button onClick={generate} disabled={loading} className="w-full py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
          <Wand2 size={15} />{loading ? 'Generating...' : 'Generate with AI'}
        </button>
        {result && (
          <>
            <textarea value={result} onChange={e => setResult(e.target.value)} rows={10} className={`${inputCls} resize-none`} style={inputStyle} />
            <button onClick={() => { onApply(result); onClose(); }} className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'rgba(45,212,191,0.15)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}>Use This Description</button>
          </>
        )}
      </div>
    </Modal>
  );
}

function AddJobModal({ onClose, onCreated, initialDescription }) {
  const { register, handleSubmit, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (initialDescription) setValue('description', initialDescription); }, [initialDescription]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const r = await api.post('/jobs', { ...data, requirements: data.requirements ? data.requirements.split(',').map(s => s.trim()) : [], salaryMin: data.salaryMin ? Number(data.salaryMin) : null, salaryMax: data.salaryMax ? Number(data.salaryMax) : null });
      toast.success('Job created'); onCreated(r.data); onClose();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Job Opening" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {[['title','Title',true],['department','Department',true],['location','Location',false]].map(([f,l,req]) => (
          <div key={f}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>{l}</label>
            <input {...register(f,{required:req})} className={inputCls} style={inputStyle} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Type</label>
          <select {...register('type')} className={inputCls} style={inputStyle}>
            {['full-time','part-time','contract','internship'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Requirements (comma-separated)</label>
          <input {...register('requirements')} className={inputCls} style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Min Salary</label><input {...register('salaryMin')} type="number" className={inputCls} style={inputStyle} /></div>
          <div><label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Max Salary</label><input {...register('salaryMax')} type="number" className={inputCls} style={inputStyle} /></div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Description</label>
          <textarea {...register('description')} rows={5} className={`${inputCls} resize-none`} style={inputStyle} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#8d96a0' }}>Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>{loading ? 'Creating...' : 'Create Job'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showJD, setShowJD] = useState(false);
  const [jdDescription, setJdDescription] = useState('');
  const canEdit = ['admin', 'recruiter'].includes(user?.role);

  useEffect(() => { api.get('/jobs').then(r => setJobs(r.data)).catch(() => {}); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    try { await api.delete(`/jobs/${id}`); setJobs(j => j.filter(jb => jb.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Job Openings</h1>
          <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{jobs.length} positions</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => setShowJD(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}><Wand2 size={14} /> AI Generate JD</button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}><Plus size={14} /> Add Job</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => {
          const sp = STATUS_PILL[job.status] || STATUS_PILL.open;
          return (
            <div key={job.id} className="rounded-xl p-5 transition-colors hover:bg-[#1f2840]" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(88,166,255,0.1)' }}>
                  <Briefcase size={17} style={{ color: '#58a6ff' }} />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: sp.bg, color: sp.color }}>{job.status}</span>
              </div>
              <h3 className="font-semibold text-white">{job.title}</h3>
              <p className="text-sm mt-0.5" style={{ color: '#8d96a0' }}>{job.department}</p>
              <div className="flex items-center gap-3 mt-2">
                {job.location && <span className="flex items-center gap-1 text-xs" style={{ color: '#4d5566' }}><MapPin size={11} />{job.location}</span>}
                <span className="flex items-center gap-1 text-xs" style={{ color: '#4d5566' }}><Users size={11} />{job._count?.applications || 0} applicants</span>
              </div>
              {job.requirements?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">{job.requirements.slice(0,3).map(r => <span key={r} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#8d96a0' }}>{r}</span>)}</div>
              )}
              {job.salaryMin && <p className="text-xs font-medium mt-2" style={{ color: '#2dd4bf' }}>${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()}</p>}
              {canEdit && <button onClick={() => handleDelete(job.id)} className="mt-3 text-xs hover:text-[#f87171] transition-colors" style={{ color: '#4d5566' }}>Delete</button>}
            </div>
          );
        })}
      </div>

      {showJD && <JDGeneratorModal onClose={() => setShowJD(false)} onApply={d => { setJdDescription(d); setShowAdd(true); }} />}
      {showAdd && <AddJobModal onClose={() => { setShowAdd(false); setJdDescription(''); }} onCreated={j => setJobs(p => [j, ...p])} initialDescription={jdDescription} />}
    </div>
  );
}
