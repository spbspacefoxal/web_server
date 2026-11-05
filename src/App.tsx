import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Database from './components/Database';
import Logs from './components/Logs';
import Settings from './components/Settings';
import ApiEndpoints from './components/ApiEndpoints';

type Tab = 'dashboard' | 'database' | 'api' | 'logs' | 'settings';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Обзор', icon: '📊' },
  { id: 'database', label: 'База данных', icon: '🗄' },
  { id: 'api', label: 'API', icon: '🔌' },
  { id: 'logs', label: 'Логи', icon: '📋' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} transition-all duration-300 bg-[#12141c] border-r border-[#2d3348] flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#2d3348]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              M
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-bold text-white">MiniServer</h1>
                <p className="text-[10px] text-slate-500">Win64 • v2.4.1</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span className="text-lg flex-shrink-0">{tab.icon}</span>
              {!sidebarCollapsed && <span className="font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Server Status */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-[#2d3348]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 pulse-green" />
              <span className="text-xs text-green-400">Сервер работает</span>
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <p>localhost:8080</p>
              <p>SQLite • 3 tables</p>
              <p>Uptime: 14ч 32м</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 border-t border-[#2d3348] text-slate-500 hover:text-slate-300 transition-colors text-center"
        >
          {sidebarCollapsed ? '→' : '← Свернуть'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-[#0f1117]/80 backdrop-blur-lg border-b border-[#2d3348] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
              <h2 className="text-lg font-semibold">{tabs.find(t => t.id === activeTab)?.label}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Все системы работают</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>🖥 Windows x64</span>
                <span className="text-slate-600">|</span>
                <span>4.2 MB</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'database' && <Database />}
          {activeTab === 'api' && <ApiEndpoints />}
          {activeTab === 'logs' && <Logs />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
