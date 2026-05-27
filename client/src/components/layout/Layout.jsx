import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';

function formatActivity(n) {
  const { action, entity, details } = n;
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

export default function Layout() {
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('new_activity', d => setNotifications(p => [d, ...p].slice(0, 20)));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1117' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-end px-6 py-3.5 shrink-0" style={{ background: '#161b27', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-lg transition-colors hover:bg-white/5">
              <Bell size={18} style={{ color: '#8d96a0' }} />
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2dd4bf] rounded-full" />}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto" style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-sm font-semibold text-white">Activity</span>
                  <button onClick={() => setNotifications([])} className="text-xs hover:text-white" style={{ color: '#4d5566' }}>Clear</button>
                </div>
                {notifications.length === 0
                  ? <div className="p-4 text-center text-sm" style={{ color: '#4d5566' }}>No recent activity</div>
                  : notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <p className="text-sm"><span className="font-medium text-white">{n.user?.name}</span> <span style={{ color: '#8d96a0' }}>{formatActivity(n)}</span></p>
                      <p className="text-xs mt-0.5" style={{ color: '#4d5566' }}>{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
