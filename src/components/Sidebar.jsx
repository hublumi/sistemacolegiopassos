import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Home, Wallet, Users, FileText, Search, Calendar,
  Settings, ChevronLeft, ChevronRight, Sun, Moon, LogOut, Mail
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard',       path: '/',              icon: Home },
  { name: 'CRM / Leads',     path: '/crm',           icon: Users },
  { name: 'E-mails (Workspace)',path: '/emails',     icon: Mail },
  { name: 'Gerador de Blog', path: '/blog-generator',icon: FileText },
  { name: 'SEO & Posts',     path: '/seo',           icon: Search },
  { name: 'Financeiro',      path: '/financeiro',    icon: Wallet },
  { name: 'Calendário',      path: '/calendario',    icon: Calendar },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light'; } catch { return 'light'; }
  });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user?.email) {
        setUserEmail(data.session.user.email);
      } else {
        const bypass = localStorage.getItem('passos_bypass_session');
        if (bypass) {
          try {
            setUserEmail(JSON.parse(bypass).email || '');
          } catch {
            setUserEmail('Admin');
          }
        }
      }
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('passos_bypass_session');
    navigate('/login');
  };

  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'CP';

  return (
    <aside
      className={`h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface-container-lowest flex flex-col transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20 p-4' : 'w-64 p-6'
      }`}
    >
      {/* ── Header: Logo ── */}
      <div className="flex items-center justify-between mb-10">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-orange-200 overflow-hidden shrink-0">
              <img
                src="/logo_colegio.png"
                alt="Colégio Passos"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-white text-xs font-black">CP</span>`;
                }}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-sm font-bold text-on-surface">Colégio Passos</span>
              <span className="text-[10px] text-secondary">Sistema Interno</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-full flex justify-center mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-orange-200">
              <span className="text-white text-xs font-black">CP</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-secondary-container transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-xl transition-all duration-200 ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              } ${
                isActive
                  ? 'bg-secondary-container text-primary font-semibold'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                className={isActive ? 'text-primary' : ''}
              />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="mt-auto pt-6 border-t border-outline-variant space-y-1">
        <button
          onClick={toggleTheme}
          title={isCollapsed ? (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : undefined}
          className={`w-full flex items-center text-secondary hover:text-on-surface transition-colors rounded-xl hover:bg-surface-container-low ${
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          {!isCollapsed && <span className="text-sm">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>

        <Link
          to="/settings"
          title={isCollapsed ? 'Configurações' : undefined}
          className={`flex items-center text-secondary hover:text-on-surface transition-colors rounded-xl hover:bg-surface-container-low ${
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
          }`}
        >
          <Settings size={18} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm">Configurações</span>}
        </Link>

        {/* User avatar + logout */}
        <div className={`flex items-center pt-4 gap-3 ${isCollapsed ? 'flex-col' : 'px-2'}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary shrink-0 shadow-md shadow-orange-100">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">{userEmail || 'Admin'}</p>
              <p className="text-[10px] text-secondary">Administrador</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sair"
            className="text-secondary hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
