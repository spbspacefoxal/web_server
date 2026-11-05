import React, { useState } from 'react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'active' | 'deprecated' | 'disabled';
  auth: boolean;
  avgTime: number;
}

const defaultEndpoints: Endpoint[] = [
  { method: 'GET', path: '/api/health', description: 'Проверка статуса сервера', status: 'active', auth: false, avgTime: 3 },
  { method: 'GET', path: '/api/users', description: 'Список пользователей', status: 'active', auth: true, avgTime: 12 },
  { method: 'POST', path: '/api/users', description: 'Создать пользователя', status: 'active', auth: true, avgTime: 45 },
  { method: 'GET', path: '/api/users/:id', description: 'Получить пользователя по ID', status: 'active', auth: true, avgTime: 8 },
  { method: 'PUT', path: '/api/users/:id', description: 'Обновить пользователя', status: 'active', auth: true, avgTime: 23 },
  { method: 'DELETE', path: '/api/users/:id', description: 'Удалить пользователя', status: 'active', auth: true, avgTime: 15 },
  { method: 'GET', path: '/api/keys', description: 'Список API ключей', status: 'active', auth: true, avgTime: 10 },
  { method: 'POST', path: '/api/keys', description: 'Сгенерировать API ключ', status: 'active', auth: true, avgTime: 32 },
  { method: 'DELETE', path: '/api/keys/:id', description: 'Отозвать API ключ', status: 'active', auth: true, avgTime: 11 },
  { method: 'GET', path: '/api/stats', description: 'Статистика сервера', status: 'active', auth: true, avgTime: 18 },
  { method: 'GET', path: '/v1/users', description: 'Старый API пользователей', status: 'deprecated', auth: true, avgTime: 25 },
  { method: 'GET', path: '/api/debug', description: 'Отладочная информация', status: 'disabled', auth: true, avgTime: 0 },
];

export default function ApiEndpoints() {
  const [endpoints] = useState<Endpoint[]>(defaultEndpoints);
  const [filter, setFilter] = useState<'all' | 'active' | 'deprecated' | 'disabled'>('all');
  const [testResult, setTestResult] = useState<{ endpoint: string; result: string } | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const filtered = endpoints.filter(e => filter === 'all' || e.status === filter);

  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const statusBadge: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    deprecated: 'bg-yellow-500/20 text-yellow-400',
    disabled: 'bg-slate-500/20 text-slate-400',
  };

  function testEndpoint(endpoint: Endpoint) {
    const key = `${endpoint.method} ${endpoint.path}`;
    setTesting(key);
    setTestResult(null);

    setTimeout(() => {
      if (endpoint.status === 'disabled') {
        setTestResult({ endpoint: key, result: '❌ 503 Service Unavailable — endpoint отключен' });
      } else if (endpoint.status === 'deprecated') {
        setTestResult({ endpoint: key, result: `⚠️ 301 Moved — Используйте /api${endpoint.path.replace('/v1', '')}` });
      } else {
        const status = endpoint.method === 'POST' ? '201 Created' : '200 OK';
        const time = endpoint.avgTime + Math.floor(Math.random() * 10);
        setTestResult({
          endpoint: key,
          result: `✅ ${status} — ${time}ms — {"status": "ok", "data": [...]}`,
        });
      }
      setTesting(null);
    }, 800);
  }

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🔌 API Endpoints</h2>
          <p className="text-slate-400 text-sm mt-1">
            {endpoints.filter(e => e.status === 'active').length} активных •{' '}
            {endpoints.filter(e => e.status === 'deprecated').length} устаревших •{' '}
            {endpoints.filter(e => e.status === 'disabled').length} отключенных
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'deprecated', 'disabled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'active' ? '✅ Активные' : f === 'deprecated' ? '⚠️ Устаревшие' : '⛔ Отключенные'}
          </button>
        ))}
      </div>

      {/* Test Result */}
      {testResult && (
        <div className="glass-card rounded-xl p-4 animate-slide-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-mono">{testResult.endpoint}</span>
            <button onClick={() => setTestResult(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          </div>
          <pre className="text-sm font-mono text-green-400 bg-slate-900/50 rounded p-3 overflow-x-auto">
            {testResult.result}
          </pre>
        </div>
      )}

      {/* Endpoints List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {filtered.map(endpoint => {
            const key = `${endpoint.method} ${endpoint.path}`;
            return (
              <div
                key={key}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors"
              >
                <span className={`px-2.5 py-1 rounded text-xs font-bold border ${methodColors[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono text-slate-200 flex-1">
                  {endpoint.path}
                </code>
                <span className="text-xs text-slate-400 hidden md:block max-w-[200px] truncate">
                  {endpoint.description}
                </span>
                {endpoint.auth && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">🔒</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded ${statusBadge[endpoint.status]}`}>
                  {endpoint.status === 'active' ? 'active' : endpoint.status === 'deprecated' ? 'deprecated' : 'disabled'}
                </span>
                {endpoint.status === 'active' && (
                  <span className="text-xs text-slate-500 font-mono">
                    ~{endpoint.avgTime}ms
                  </span>
                )}
                <button
                  onClick={() => testEndpoint(endpoint)}
                  disabled={testing === key}
                  className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-medium hover:bg-indigo-500/30 border border-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {testing === key ? '⏳' : '▶ Test'}
                </button>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-2xl mb-2">🔌</p>
            <p>Нет endpoints в этой категории</p>
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">📖 Быстрая справка</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Аутентификация</p>
            <code className="text-xs text-indigo-400 font-mono">
              Authorization: Bearer msk_***
            </code>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Content-Type</p>
            <code className="text-xs text-indigo-400 font-mono">
              application/json
            </code>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Base URL</p>
            <code className="text-xs text-indigo-400 font-mono">
              http://localhost:8080
            </code>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Rate Limit</p>
            <code className="text-xs text-indigo-400 font-mono">
              100 req/min per API key
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
