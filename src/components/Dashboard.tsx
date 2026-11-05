import React, { useState, useEffect } from 'react';
import { getStats, formatUptime, formatBytes, getDB, getConfig, getLogs } from '../db';
import type { ServerStats } from '../db';

export default function Dashboard() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [serverRunning, setServerRunning] = useState(true);

  useEffect(() => {
    setStats(getStats());
    const interval = setInterval(() => {
      setStats(getStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const config = getConfig();
  const db = getDB();
  const logs = getLogs();
  const recentErrors = logs.filter(l => l.level === 'error').slice(0, 3);
  const recentWarnings = logs.filter(l => l.level === 'warn').slice(0, 3);

  return (
    <div className="animate-slide-in space-y-6">
      {/* Server Status Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${serverRunning ? 'bg-green-500 pulse-green' : 'bg-red-500'}`} />
            <div>
              <h2 className="text-xl font-bold">MiniServer v2.4.1</h2>
              <p className="text-sm text-slate-400">
                {config.host}:{config.port} • {config.dbEngine} • Win64
              </p>
            </div>
          </div>
          <button
            onClick={() => setServerRunning(!serverRunning)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              serverRunning
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            }`}
          >
            {serverRunning ? '⏹ Остановить' : '▶ Запустить'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="⏱"
          label="Аптайм"
          value={formatUptime(stats.uptime)}
          color="text-blue-400"
        />
        <StatCard
          icon="📡"
          label="Запросов всего"
          value={stats.requestsTotal.toLocaleString()}
          color="text-green-400"
        />
        <StatCard
          icon="⚡"
          label="Запросов/мин"
          value={stats.requestsPerMinute.toString()}
          color="text-yellow-400"
        />
        <StatCard
          icon="🔗"
          label="Соединений"
          value={`${stats.activeConnections}/${config.maxConnections}`}
          color="text-purple-400"
        />
        <StatCard
          icon="💾"
          label="Память"
          value={`${stats.memoryUsage}%`}
          color="text-cyan-400"
        />
        <StatCard
          icon="🖥"
          label="CPU"
          value={`${stats.cpuUsage}%`}
          color="text-orange-400"
        />
        <StatCard
          icon="🗄"
          label="Размер БД"
          value={formatBytes(stats.dbSize)}
          color="text-pink-400"
        />
        <StatCard
          icon="⚙"
          label="Ср. ответ"
          value={`${stats.avgResponseTime}ms`}
          color="text-indigo-400"
        />
      </div>

      {/* Charts & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Использование ресурсов</h3>
          <div className="space-y-4">
            <ResourceBar label="CPU" value={stats.cpuUsage} color="bg-orange-500" />
            <ResourceBar label="RAM" value={stats.memoryUsage} color="bg-cyan-500" />
            <ResourceBar label="Диск" value={Math.floor(stats.dbSize / 5)} color="bg-pink-500" />
            <ResourceBar label="Сеть" value={Math.floor(Math.random() * 40) + 15} color="bg-green-500" />
          </div>
        </div>

        {/* Database Overview */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🗄 База данных</h3>
          <div className="space-y-3">
            {db.tables.map(table => (
              <div key={table.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="font-medium text-sm">{table.name}</p>
                    <p className="text-xs text-slate-400">{table.columns.length} колонок</p>
                  </div>
                </div>
                <span className="text-sm text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                  {table.rows.length} записей
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🔴 Последние ошибки</h3>
          {recentErrors.length === 0 ? (
            <p className="text-slate-400 text-sm">Ошибок не обнаружено ✓</p>
          ) : (
            <div className="space-y-2">
              {recentErrors.map(log => (
                <div key={log.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-400 font-mono">{log.source}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-red-300 mt-1">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🟡 Предупреждения</h3>
          {recentWarnings.length === 0 ? (
            <p className="text-slate-400 text-sm">Предупреждений нет ✓</p>
          ) : (
            <div className="space-y-2">
              {recentWarnings.map(log => (
                <div key={log.id} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-400 font-mono">{log.source}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-300 mt-1">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
