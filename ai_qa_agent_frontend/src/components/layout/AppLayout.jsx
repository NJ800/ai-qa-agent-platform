import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, CheckCircle, BarChart2, LogOut, Moon, Sun, Shield, GitPullRequest } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useTheme } from '../../utils/theme';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/stories', icon: FileText, label: 'Active Stories' },
    { path: '/story-input', icon: FileText, label: 'Submit Story' },
    { path: '/prs', icon: GitPullRequest, label: 'Pull Requests' },
    { path: '/pr-input', icon: GitPullRequest, label: 'Submit PR' },
    { path: '/qa-analysis', icon: CheckCircle, label: 'QA Analysis' },
    { path: '/tests', icon: FileText, label: 'Test Cases' },
    { path: '/metrics', icon: BarChart2, label: 'Metrics' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#020817]">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Shield className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">QA-Agent</span>
        </div>
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path} className="px-3">
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-sm font-medium dark:text-slate-200 truncate w-24">
              {user?.username || 'User'}
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center md:hidden">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold dark:text-white">QA-Agent</span>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
