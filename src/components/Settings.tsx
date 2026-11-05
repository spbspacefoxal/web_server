import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig, addLog } from '../db';
import type { ServerConfig } from '../db';

export default function Settings() {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  function handleSave() {
    if (!config) return;
    saveConfig(config);
    addLog('info', 'SYSTEM', `Configuration updated: port=${config.port}, host=${config.host}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!config) return null;

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">⚙️ Настройки сервера</h2>
          <p className="text-slate-400 text-sm mt-1">Конфигурация MiniServer для Windows x64</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500/30 text-green-400 border border-green-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {saved ? '✓ Сохранено' : '💾 Сохранить'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🌐 Сеть
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Хост</label>
              <input
                type="text"
                value={config.host}
                onChange={e => setConfig({ ...config, host: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Порт</label>
              <input
                type="number"
                value={config.port}
                onChange={e => setConfig({ ...config, port: parseInt(e.target.value) || 8080 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Макс. соединений</label>
              <input
                type="number"
                value={config.maxConnections}
                onChange={e => setConfig({ ...config, maxConnections: parseInt(e.target.value) || 100 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Таймаут (сек)</label>
              <input
                type="number"
                value={config.timeout}
                onChange={e => setConfig({ ...config, timeout: parseInt(e.target.value) || 30 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🗄 База данных
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Движок БД</label>
              <select
                value={config.dbEngine}
                onChange={e => setConfig({ ...config, dbEngine: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="SQLite">SQLite</option>
                <option value="LevelDB">LevelDB</option>
                <option value="RocksDB">RocksDB</option>
                <option value="DuckDB">DuckDB</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Путь к БД</label>
              <input
                type="text"
                value={config.dbPath}
                onChange={e => setConfig({ ...config, dbPath: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">
                💡 Рекомендуемый движок: <strong className="text-indigo-400">SQLite</strong> — компактный, быстрый, не требует отдельного сервера.
                Размер файла БД: ~12 MB
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🔧 Функции
          </h3>
          <div className="space-y-4">
            <ToggleOption
              label="CORS"
              description="Разрешить кросс-доменные запросы"
              enabled={config.enableCORS}
              onChange={v => setConfig({ ...config, enableCORS: v })}
            />
            <ToggleOption
              label="Gzip сжатие"
              description="Сжимать ответы для экономии трафика"
              enabled={config.enableGzip}
              onChange={v => setConfig({ ...config, enableGzip: v })}
            />
            <ToggleOption
              label="Кэширование"
              description="Кэшировать статические файлы"
              enabled={config.enableCache}
              onChange={v => setConfig({ ...config, enableCache: v })}
            />
            {config.enableCache && (
              <div>
                <label className="text-sm text-slate-400 block mb-1">TTL кэша (сек)</label>
                <input
                  type="number"
                  value={config.cacheTTL}
                  onChange={e => setConfig({ ...config, cacheTTL: parseInt(e.target.value) || 3600 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Logging */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📝 Логирование
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Уровень логов</label>
              <select
                value={config.logLevel}
                onChange={e => setConfig({ ...config, logLevel: e.target.value as ServerConfig['logLevel'] })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="debug">Debug — всё</option>
                <option value="info">Info — стандартный</option>
                <option value="warn">Warn — только предупреждения</option>
                <option value="error">Error — только ошибки</option>
              </select>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">
                📂 Логи хранятся в: <code className="text-indigo-400">./logs/miniserver.log</code>
                <br />Ротация: ежедневно, хранение 30 дней
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Build Info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">📦 Информация о сборке</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem label="Платформа" value="Windows x64" />
          <InfoItem label="Версия" value="2.4.1" />
          <InfoItem label="Сборка" value="#20240328" />
          <InfoItem label="Размер" value="4.2 MB" />
          <InfoItem label="Runtime" value="Go 1.22" />
          <InfoItem label="Компиляция" value="CGO=0 (static)" />
          <InfoItem label="Зависимости" value="Нет (standalone)" />
          <InfoItem label="Лицензия" value="MIT" />
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, enabled, onChange }: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 rounded-full transition-all relative ${
          enabled ? 'bg-indigo-500' : 'bg-slate-600'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
          enabled ? 'left-6' : 'left-1'
        }`} />
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-800/50 rounded-lg">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}
