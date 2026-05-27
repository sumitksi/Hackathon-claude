import { useState, useEffect } from 'react';
import { Plus, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' };
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm placeholder-[#4d5566] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]';
const ROLE_PILL = { admin: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' }, recruiter: { bg: 'rgba(88,166,255,0.12)', color: '#58a6ff' }, interviewer: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' }, viewer: { bg: 'rgba(255,255,255,0.06)', color: '#8d96a0' } };

function AddMemberModal({ onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    try { const r = await api.post('/auth/register', data); toast.success('Member added'); onCreated(r.data.user); onClose(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">Add Team Member</h2>
          <button onClick={onClose} className="hover:text-white" style={{ color: '#4d5566' }}><X size={18} /></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {[['name','Full Name','text'],['email','Email','email'],['password','Password','password']].map(([f,l,t]) => (
              <div key={f}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>{l}</label>
                <input {...register(f,{required:true})} type={t} className={inputCls} style={inputStyle} />
                {errors[f] && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Role</label>
              <select {...register('role')} className={inputCls} style={inputStyle}>
                {['recruiter','interviewer','viewer','admin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#8d96a0' }}>Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>{loading ? 'Adding...' : 'Add Member'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  useEffect(() => { api.get('/auth/users').then(r => setUsers(r.data)).catch(() => {}); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Team Management</h1>
          <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{users.length} members</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}><Plus size={14} /> Add Member</button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Member','Email','Role','Joined'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4d5566' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const rp = ROLE_PILL[u.role] || ROLE_PILL.viewer;
              return (
                <tr key={u.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1f6feb55, #8b5cf655)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: '#8d96a0' }}>{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium capitalize" style={{ background: rp.bg, color: rp.color }}>
                      {u.role === 'admin' && <Shield size={10} />}{u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: '#4d5566' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onCreated={u => setUsers(p => [...p, u])} />}
    </div>
  );
}
