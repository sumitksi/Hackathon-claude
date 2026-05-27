import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc' };
const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm placeholder-[#4d5566] focus:outline-none focus:ring-1 focus:ring-[#1f6feb]';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { register: rp, handleSubmit: hp } = useForm({ defaultValues: { name: user?.name, avatar: user?.avatar } });
  const { register: rpw, handleSubmit: hpw, reset, formState: { errors } } = useForm();
  const [loadingP, setLoadingP] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  const onProfile = async (data) => {
    setLoadingP(true);
    try { const r = await api.patch('/auth/profile', data); updateUser(r.data); toast.success('Profile updated'); }
    catch { toast.error('Failed'); } finally { setLoadingP(false); }
  };

  const onPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) return toast.error('Passwords do not match');
    setLoadingPw(true);
    try { await api.patch('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword }); toast.success('Password changed'); reset(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoadingPw(false); }
  };

  const Section = ({ title, children }) => (
    <div className="rounded-xl p-6" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: '#4d5566' }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-xl font-bold text-white">Profile</h1>

      <Section title="Account">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm mt-0.5" style={{ color: '#8d96a0' }}>{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs capitalize" style={{ background: 'rgba(88,166,255,0.12)', color: '#58a6ff' }}>{user?.role}</span>
          </div>
        </div>
        <form onSubmit={hp(onProfile)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Full Name</label>
            <input {...rp('name',{required:true})} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>Email</label>
            <input value={user?.email} disabled className={inputCls} style={{ ...inputStyle, opacity: 0.4 }} />
          </div>
          <button type="submit" disabled={loadingP} className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            {loadingP ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Section>

      <Section title="Change Password">
        <form onSubmit={hpw(onPassword)} className="space-y-3.5">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([f,l]) => (
            <div key={f}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8d96a0' }}>{l}</label>
              <input {...rpw(f,{required:true})} type="password" className={inputCls} style={inputStyle} />
              {errors[f] && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>
          ))}
          <button type="submit" disabled={loadingPw} className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            {loadingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </Section>
    </div>
  );
}
