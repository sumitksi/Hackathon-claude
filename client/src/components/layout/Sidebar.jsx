import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Calendar, BarChart3, Search, FileText, User, LogOut, Shield, TrendingDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/interviews', icon: Calendar, label: 'Interviews' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/ai-search', icon: Search, label: 'AI Search' },
  { to: '/rejection-intelligence', icon: TrendingDown, label: 'Rejection Intel' },
];

const adminItems = [
  { to: '/users', icon: Users, label: 'Team' },
  { to: '/audit-log', icon: FileText, label: 'Audit Log' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#1f6feb] text-white shadow-lg'
        : 'text-[#8d96a0] hover:bg-white/5 hover:text-[#f0f6fc]'
    }`;

  return (
    <aside className="w-60 flex flex-col h-full shrink-0" style={{ background: '#161b27', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
          🐝
        </div>
        <div>
          <p className="text-sm font-bold text-white">ReportBee</p>
          <p className="text-xs" style={{ color: '#4d5566' }}>MIS Platform</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold px-3 pt-3 pb-2 uppercase tracking-wider" style={{ color: '#4d5566' }}>Workspace</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={17} />{label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <>
            <p className="text-xs font-semibold px-3 pt-4 pb-2 uppercase tracking-wider" style={{ color: '#4d5566' }}>Admin</p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon size={17} />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f6feb, #8b5cf6)' }}>
            {user?.name?.charAt(0)}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs capitalize" style={{ color: '#4d5566' }}>{user?.role}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5 mt-0.5" style={{ color: '#8d96a0' }}>
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );
}
