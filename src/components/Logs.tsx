import React, { useState, useEffect } from 'react';
import { getLogs, addLog } from '../db';
import type { LogEntry } from '../db';

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    refreshLogs();
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  function refreshLogs() {
    setLogs(getLogs());
  }

  const sources = ['all', ...new Set(logs.map(l => l.source))];
  
  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    return true;
  });

  const levelColors: Record<string, string> = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    warn: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
    debug: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  const levelIcons: Record<string, string> = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🔧',
  };

  return (
    <div className="animate-slide-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📋 Логи сервера</h2>
          <p className="text-slate-400 text-sm mt-1">
            {filteredLogs.length} записей • Автообновление: {autoRefresh ? 'вкл' : 'выкл'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-slate-700 text-slate-400 border-slate-600'
            }`}
          >
            {autoRefresh ? '⏸ Пауза' : '▶ Обновление'}
          </button>
          <button
            onClick={refreshLogs}
            className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-all"
          >
            🔄 Обновить
          </button>
          <button
            onClick={() => {
              addLog('info', 'SYSTEM', 'Manual log refresh triggered');
              refreshLogs();
            }}
            className="px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
          >
            + Тестовый лог
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Уровень</label>
            <div className="flex gap-1">
              {(['all', 'info', 'warn', 'error', 'debug'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    filter === level
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {level === 'all' ? 'Все' : level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Источник</label>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {sources.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'Все' : s}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {logs.filter(l => l.level === 'info').length} info
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                {logs.filter(l => l.level === 'warn').length} warn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                {logs.filter(l => l.level === 'error').length} error
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log, idx) => (
            <div
              key={log.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                idx === 0 ? 'animate-slide-in' : ''
              }`}
            >
              <span className="text-sm mt-0.5">{levelIcons[log.level]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${levelColors[log.level]}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{log.source}</span>
                </div>
                <p className="text-sm text-slate-300 truncate">{log.message}</p>
              </div>
              <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-2xl mb-2">📭</p>
              <p>Нет записей для отображения</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
