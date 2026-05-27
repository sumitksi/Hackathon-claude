import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try { const res = await api.post('/auth/login', data); login(res.data); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  const inputCls = 'w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#4d5566] focus:outline-none focus:ring-2 focus:ring-[#1f6feb]';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d1117' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            🐝
          </div>
          <h1 className="text-2xl font-bold text-white">ReportBee</h1>
          <p className="text-sm mt-1" style={{ color: '#8d96a0' }}>Sign in to your account</p>
        </div>
        <div className="p-6 rounded-xl" style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8d96a0' }}>Email</label>
              <input {...register('email', { required: true })} type="email" className={inputCls}
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="admin@company.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8d96a0' }}>Password</label>
              <input {...register('password', { required: true })} type="password" className={inputCls}
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="••••••••" />
              {errors.password && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs mt-4" style={{ color: '#4d5566' }}>admin@company.com · password123</p>
        </div>
      </div>
    </div>
  );
}
