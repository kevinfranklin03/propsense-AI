import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Thermometer, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  Building2,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  // Default to Dark Mode as per "Pro" request
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { name: 'Overview', icon: Home, path: '/' },
    { name: 'Property Map', icon: Map, path: '/map' },
    { name: 'Live Sensors', icon: Thermometer, path: '/sensors' },
    { name: 'Tickets', icon: Ticket, path: '/tickets' },
    { name: 'Tenants', icon: Users, path: '/tenants' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'About', icon: Building2, path: '/about' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Building2 className="w-6 h-6 text-blue-400 mr-3" />
          <span className="text-lg font-bold tracking-tight">PropSense AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3 opacity-75 group-hover:opacity-100" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle & Profile */}
        <div className="p-4 border-t border-slate-800 space-y-4">
            
          {/* Toggle Switch */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-medium text-slate-300"
          >
              <span className="flex items-center">
                  {isDark ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className={cn("w-8 h-4 rounded-full relative transition-colors", isDark ? "bg-blue-600" : "bg-slate-600")}>
                  <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", isDark ? "left-4.5" : "left-0.5")}></div>
              </div>
          </button>

          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow-md">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">Landlord Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
