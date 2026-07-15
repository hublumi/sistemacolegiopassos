import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './features/dashboard/Dashboard';
import Finance from './features/finance/Finance';
import BlogGenerator from './features/blog-generator/BlogGenerator';
import CalendarView from './features/calendar/CalendarView';
import SettingsView from './features/settings/Settings';
import Login from './features/auth/Login';
import CRM from './features/crm/CRM';
import SEOView from './features/seo/SEOView';
import EmailView from './features/emails/EmailView';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={
          <ProtectedRoute>
            <div className="flex bg-background text-on-surface">
              <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
              <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
                <Routes>
                  <Route path="/"              element={<Dashboard isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/crm"           element={<CRM isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/emails"        element={<EmailView isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/blog-generator"element={<BlogGenerator isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/seo"           element={<SEOView isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/financeiro"    element={<Finance isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/calendario"    element={<CalendarView isSidebarCollapsed={sidebarCollapsed} />} />
                  <Route path="/settings"      element={<SettingsView isSidebarCollapsed={sidebarCollapsed} />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
