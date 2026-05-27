import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Brain, Send, MessageSquare, X, Star, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
const STATUS_PILL = { applied: { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff' }, screening: { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }, interview: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' }, offer: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' }, hired: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' }, rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' } };

const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' };
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm placeholder-[#4d5566] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl max-h-[90vh] overflow-y-auto" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="hover:text-white" style={{ color: '#4d5566' }}><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SmartRejectionModal({ candidate, applicationId, onClose }) {
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try { const r = await api.post('/ai/rejection-suggest', { candidateId: candidate.id, applicationId, reason }); setEmail(r.data.email); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  return (
    <Modal title="Smart Rejection Email" onClose={onClose}>
      <div className="space-y-3.5">
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Rejection reason (optional)" className={inputCls} style={inputStyle} />
        <button onClick={generate} disabled={loading} className="w-full py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>{loading ? 'Generating...' : 'Generate Email'}</button>
        {email && <textarea value={email} onChange={e => setEmail(e.target.value)} rows={8} className={`${inputCls} resize-none`} style={inputStyle} />}
        {email && <button onClick={() => { navigator.clipboard.writeText(email); toast.success('Copied!'); }} className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}>Copy to Clipboard</button>}
      </div>
    </Modal>
  );
}

function ParseResumeModal({ candidateId, onApply, onClose }) {
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    api.get(`/ai/parse-resume/${candidateId}`)
      .then(r => {
        setParsed(r.data);
        const init = {};
        Object.entries(r.data).forEach(([k, v]) => {
          if (v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')) init[k] = true;
        });
        setSelected(init);
      })
      .catch(e => toast.error(e.response?.data?.error || 'Parse failed'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = k => setSelected(s => ({ ...s, [k]: !s[k] }));

  const apply = async () => {
    setApplying(true);
    const update = {};
    Object.keys(selected).forEach(k => { if (selected[k] && parsed[k] !== null) update[k] = parsed[k]; });
    await onApply(update);
    setApplying(false);
    onClose();
  };

  const fieldLabel = { name: 'Name', email: 'Email', phone: 'Phone', currentRole: 'Current Role', experience: 'Experience (yrs)', location: 'Location', skills: 'Skills' };

  return (
    <Modal title="AI Resume Parser" onClose={onClose}>
      {loading ? (
        <p className="text-sm text-center py-4" style={{ color: '#4d5566' }}>Parsing resume with AI...</p>
      ) : !parsed ? null : (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: '#8d96a0' }}>Select fields to apply to this candidate's profile:</p>
          {Object.entries(fieldLabel).map(([k, label]) => {
            const val = parsed[k];
            if (val === null || val === undefined || (Array.isArray(val) && val.length === 0) || val === '') return null;
            return (
              <label key={k} className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <input type="checkbox" checked={!!selected[k]} onChange={() => toggle(k)} className="mt-0.5 accent-[#1f6feb]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#8d96a0' }}>{label}</p>
                  <p className="text-sm text-white truncate">{Array.isArray(val) ? val.join(', ') : String(val)}</p>
                </div>
              </label>
            );
          })}
          <button onClick={apply} disabled={applying || Object.values(selected).every(v => !v)}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            {applying ? 'Applying...' : 'Apply to Profile'}
          </button>
        </div>
      )}
    </Modal>
  );
}

function InterviewQuestionsModal({ candidate, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.post('/ai/interview-questions', { jobTitle: candidate.currentRole, skills: candidate.skills, type: 'technical' })
      .then(r => setQuestions(r.data.questions)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return (
    <Modal title="AI Interview Questions" onClose={onClose}>
      {loading ? <p className="text-sm" style={{ color: '#4d5566' }}>Generating questions...</p> : (
        <ol className="space-y-3">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-bold shrink-0 w-5" style={{ color: '#58a6ff' }}>{i + 1}.</span>
              <span style={{ color: '#f0f6fc' }}>{q}</span>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}

function Card({ title, children, action }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4d5566' }}>{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [summary, setSummary] = useState('');
  const [cultureFit, setCultureFit] = useState(null);
  const [notes, setNotes] = useState('');
  const [showRejection, setShowRejection] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showParseResume, setShowParseResume] = useState(false);

  useEffect(() => { api.get(`/candidates/${id}`).then(r => { setCandidate(r.data); setNotes(r.data.notes || ''); }).catch(() => navigate('/candidates')); }, [id]);

  const loadSummary = async () => {
    setLoadingAI(true);
    try { const r = await api.get(`/ai/summarize/${id}`); setSummary(r.data.summary); }
    catch { toast.error('Failed'); } finally { setLoadingAI(false); }
  };

  const loadCultureFit = async (appId) => {
    try { const r = await api.get(`/ai/culture-fit/${appId}`); setCultureFit(r.data); }
    catch { toast.error('Failed'); }
  };

  const saveNotes = async () => { await api.put(`/candidates/${id}`, { notes }); toast.success('Notes saved'); };

  const applyParsed = async (update) => {
    await api.put(`/candidates/${id}`, update);
    const r = await api.get(`/candidates/${id}`); setCandidate(r.data);
    toast.success('Profile updated from resume');
  };

  const handleStatusChange = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    const r = await api.get(`/candidates/${id}`); setCandidate(r.data); toast.success('Status updated');
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('resume', file);
    try { const r = await api.post(`/candidates/${id}/resume`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setCandidate(r.data); toast.success('Uploaded'); }
    catch { toast.error('Upload failed'); }
  };

  if (!candidate) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4d5566' }}>Loading...</div>;

  const app = candidate.applications?.[0];
  const canEdit = ['admin', 'recruiter'].includes(user?.role);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/candidates')} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#8d96a0' }}><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{candidate.name}</h1>
          <p className="text-xs mt-0.5" style={{ color: '#8d96a0' }}>{candidate.currentRole}{candidate.location ? ` · ${candidate.location}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQuestions(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.2)' }}><MessageSquare size={13} /> Questions</button>
          {app && <button onClick={() => setShowRejection(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}><Send size={13} /> Rejection</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Profile Info">
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[['Email', candidate.email], ['Phone', candidate.phone], ['Location', candidate.location], ['Experience', candidate.experience ? `${candidate.experience} years` : null], ['Source', candidate.source]].filter(([, v]) => v).map(([l, v]) => (
                <div key={l}><span style={{ color: '#4d5566' }}>{l}</span><p className="font-medium text-white mt-0.5">{v}</p></div>
              ))}
            </div>
            {candidate.skills?.length > 0 && (
              <div><p className="text-xs mb-2" style={{ color: '#4d5566' }}>Skills</p>
                <div className="flex flex-wrap gap-1.5">{candidate.skills.map(s => <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>{s}</span>)}</div>
              </div>
            )}
          </Card>

          {app && (
            <Card title="Pipeline Status">
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUSES.map((s, i) => {
                  const sp = STATUS_PILL[s];
                  const isActive = app.status === s;
                  return (
                    <div key={s} className="flex items-center gap-1.5">
                      <button onClick={() => canEdit && handleStatusChange(app.id, s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={isActive ? { background: sp.bg, color: sp.color, border: `1px solid ${sp.color}55` } : { background: 'rgba(255,255,255,0.04)', color: '#4d5566', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {s}
                      </button>
                      {i < STATUSES.length - 1 && <ChevronRight size={12} style={{ color: '#4d5566' }} />}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs mt-3" style={{ color: '#4d5566' }}>Applied to: <span style={{ color: '#8d96a0' }}>{app.job?.title}</span></p>
            </Card>
          )}

          <Card title="AI Summary" action={
            <button onClick={loadSummary} disabled={loadingAI} className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 hover:text-white transition-colors" style={{ color: '#58a6ff' }}>
              <Brain size={13} />{loadingAI ? 'Generating...' : 'Generate'}
            </button>
          }>
            {summary ? <p className="text-sm leading-relaxed" style={{ color: '#8d96a0' }}>{summary}</p> : <p className="text-sm" style={{ color: '#4d5566' }}>Click Generate to create an AI summary of this candidate</p>}
          </Card>

          {candidate.applications?.flatMap(a => a.interviews).length > 0 && (
            <Card title="Interview History">
              <div className="space-y-2.5">
                {candidate.applications.flatMap(a => a.interviews).map(iv => (
                  <div key={iv.id} className="flex items-start justify-between rounded-lg px-4 py-3" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{iv.type} Interview</p>
                      <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{new Date(iv.scheduledAt).toLocaleDateString()} · {iv.interviewer?.name}</p>
                      {iv.feedback && <p className="text-xs mt-1" style={{ color: '#8d96a0' }}>{iv.feedback}</p>}
                    </div>
                    {iv.rating && <div className="flex items-center gap-1"><Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} /><span className="text-sm font-semibold text-white">{iv.rating}/5</span></div>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card title="Resume">
            {candidate.resumeUrl ? (
              <div className="space-y-2.5">
                <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-white transition-colors block" style={{ color: '#58a6ff' }}>View Resume →</a>
                {canEdit && (
                  <>
                    <button onClick={() => setShowParseResume(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.25)' }}>
                      <Brain size={13} /> Parse Resume with AI
                    </button>
                    <label className="block cursor-pointer text-xs hover:text-white transition-colors text-center" style={{ color: '#4d5566' }}>
                      <Upload size={12} className="inline mr-1" />Replace PDF
                      <input type="file" accept=".pdf" onChange={uploadResume} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            ) : canEdit ? (
              <label className="flex flex-col items-center gap-2 p-5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Upload size={20} style={{ color: '#4d5566' }} />
                <span className="text-xs" style={{ color: '#4d5566' }}>Upload PDF Resume</span>
                <input type="file" accept=".pdf" onChange={uploadResume} className="hidden" />
              </label>
            ) : <p className="text-sm" style={{ color: '#4d5566' }}>No resume uploaded</p>}
          </Card>

          {app && (
            <Card title="Culture Fit" action={
              <button onClick={() => loadCultureFit(app.id)} className="text-xs hover:text-white transition-colors" style={{ color: '#58a6ff' }}>Analyze</button>
            }>
              {cultureFit ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: '#2dd4bf' }}>{cultureFit.score}</div>
                    <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>out of 100</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#8d96a0' }}>{cultureFit.overall}</p>
                  {cultureFit.strengths?.map((s, i) => <p key={i} className="text-xs" style={{ color: '#4ade80' }}>+ {s}</p>)}
                </div>
              ) : <p className="text-sm" style={{ color: '#4d5566' }}>Click Analyze for AI culture fit score</p>}
            </Card>
          )}

          <Card title="Recruiter Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
              className={`${inputCls} resize-none mb-3`} style={inputStyle} placeholder="Add notes about this candidate..." />
            <button onClick={saveNotes} className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>Save Notes</button>
          </Card>
        </div>
      </div>

      {showRejection && app && <SmartRejectionModal candidate={candidate} applicationId={app.id} onClose={() => setShowRejection(false)} />}
      {showQuestions && <InterviewQuestionsModal candidate={candidate} onClose={() => setShowQuestions(false)} />}
      {showParseResume && <ParseResumeModal candidateId={id} onApply={applyParsed} onClose={() => setShowParseResume(false)} />}
    </div>
  );
}
