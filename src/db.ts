// Имитация базы данных на localStorage

export interface DBTable {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
  createdAt: string;
}

export interface DBSchema {
  tables: DBTable[];
}

const DB_KEY = 'miniserver_db';
const LOGS_KEY = 'miniserver_logs';
const CONFIG_KEY = 'miniserver_config';

export interface ServerConfig {
  port: number;
  host: string;
  maxConnections: number;
  timeout: number;
  enableCORS: boolean;
  enableGzip: boolean;
  enableCache: boolean;
  cacheTTL: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  dbEngine: string;
  dbPath: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
}

export interface ServerStats {
  uptime: number;
  requestsTotal: number;
  requestsPerMinute: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  dbSize: number;
  avgResponseTime: number;
}

function getDefaultConfig(): ServerConfig {
  return {
    port: 8080,
    host: '0.0.0.0',
    maxConnections: 100,
    timeout: 30,
    enableCORS: true,
    enableGzip: true,
    enableCache: true,
    cacheTTL: 3600,
    logLevel: 'info',
    dbEngine: 'SQLite',
    dbPath: './data/miniserver.db',
  };
}

function getDefaultDB(): DBSchema {
  return {
    tables: [
      {
        name: 'users',
        columns: ['id', 'username', 'email', 'role', 'created_at'],
        rows: [
          { id: 1, username: 'admin', email: 'admin@miniserver.local', role: 'admin', created_at: '2024-01-15' },
          { id: 2, username: 'john_doe', email: 'john@example.com', role: 'user', created_at: '2024-02-20' },
          { id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'user', created_at: '2024-03-10' },
          { id: 4, username: 'bob_wilson', email: 'bob@example.com', role: 'moderator', created_at: '2024-03-25' },
        ],
        createdAt: '2024-01-15',
      },
      {
        name: 'api_keys',
        columns: ['id', 'key', 'owner', 'permissions', 'active', 'created_at'],
        rows: [
          { id: 1, key: 'msk_a1b2c3d4e5', owner: 'admin', permissions: 'full', active: true, created_at: '2024-01-15' },
          { id: 2, key: 'msk_f6g7h8i9j0', owner: 'john_doe', permissions: 'read', active: true, created_at: '2024-02-20' },
          { id: 3, key: 'msk_k1l2m3n4o5', owner: 'jane_smith', permissions: 'read,write', active: false, created_at: '2024-03-10' },
        ],
        createdAt: '2024-01-15',
      },
      {
        name: 'request_log',
        columns: ['id', 'method', 'path', 'status', 'response_time', 'timestamp'],
        rows: [
          { id: 1, method: 'GET', path: '/api/users', status: 200, response_time: 12, timestamp: '2024-03-28 10:15:23' },
          { id: 2, method: 'POST', path: '/api/users', status: 201, response_time: 45, timestamp: '2024-03-28 10:16:01' },
          { id: 3, method: 'GET', path: '/api/health', status: 200, response_time: 3, timestamp: '2024-03-28 10:17:45' },
          { id: 4, method: 'DELETE', path: '/api/users/3', status: 403, response_time: 8, timestamp: '2024-03-28 10:18:12' },
          { id: 5, method: 'PUT', path: '/api/users/2', status: 200, response_time: 23, timestamp: '2024-03-28 10:20:33' },
        ],
        createdAt: '2024-01-15',
      },
    ],
  };
}

function generateLogs(): LogEntry[] {
  const sources = ['HTTP', 'DB', 'AUTH', 'CACHE', 'SYSTEM', 'ROUTER'];
  const messages = {
    info: [
      'Server started on port 8080',
      'New connection from 192.168.1.100',
      'Database backup completed',
      'Cache cleared successfully',
      'API key validated for user admin',
      'Health check passed',
      'Static files served: /public/index.html',
      'WebSocket connection established',
    ],
    warn: [
      'High memory usage detected: 85%',
      'Slow query detected: 2340ms',
      'Connection pool near capacity: 90/100',
      'Deprecated API endpoint called: /v1/users',
      'Rate limit approaching for IP 10.0.0.5',
      'SSL certificate expires in 7 days',
    ],
    error: [
      'Failed to connect to replica DB',
      'Request timeout: /api/reports',
      'Invalid API key: msk_invalid',
      'Disk space low: 5% remaining',
      'Connection refused from 192.168.1.50',
    ],
    debug: [
      'Query plan: SELECT * FROM users WHERE id=1',
      'Route matched: GET /api/users/:id',
      'Middleware chain: [auth, cors, logger]',
      'Response serialized: 2.3KB',
      'GC completed: freed 12MB',
    ],
  };

  const logs: LogEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'info', 'info', 'warn', 'error', 'debug'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const msgs = messages[level];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const message = msgs[Math.floor(Math.random() * msgs.length)];
    const timestamp = new Date(now - i * 60000 * Math.random() * 5).toISOString();

    logs.push({
      id: `log_${i}`,
      timestamp,
      level,
      source,
      message,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// DB Operations
export function getDB(): DBSchema {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) return JSON.parse(stored);
  const defaultDB = getDefaultDB();
  localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
  return defaultDB;
}

export function saveDB(db: DBSchema): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function addTable(name: string, columns: string[]): DBTable {
  const db = getDB();
  const newTable: DBTable = {
    name,
    columns,
    rows: [],
    createdAt: new Date().toISOString(),
  };
  db.tables.push(newTable);
  saveDB(db);
  return newTable;
}

export function deleteTable(name: string): void {
  const db = getDB();
  db.tables = db.tables.filter(t => t.name !== name);
  saveDB(db);
}

export function addRow(tableName: string, row: Record<string, any>): void {
  const db = getDB();
  const table = db.tables.find(t => t.name === tableName);
  if (table) {
    row.id = table.rows.length + 1;
    table.rows.push(row);
    saveDB(db);
  }
}

export function deleteRow(tableName: string, rowId: number): void {
  const db = getDB();
  const table = db.tables.find(t => t.name === tableName);
  if (table) {
    table.rows = table.rows.filter(r => r.id !== rowId);
    saveDB(db);
  }
}

export function updateRow(tableName: string, rowId: number, updates: Record<string, any>): void {
  const db = getDB();
  const table = db.tables.find(t => t.name === tableName);
  if (table) {
    const row = table.rows.find(r => r.id === rowId);
    if (row) {
      Object.assign(row, updates);
      saveDB(db);
    }
  }
}

// Config Operations
export function getConfig(): ServerConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) return JSON.parse(stored);
  const defaultConfig = getDefaultConfig();
  localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
  return defaultConfig;
}

export function saveConfig(config: ServerConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// Logs
export function getLogs(): LogEntry[] {
  const stored = localStorage.getItem(LOGS_KEY);
  if (stored) return JSON.parse(stored);
  const logs = generateLogs();
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return logs;
}

export function addLog(level: LogEntry['level'], source: string, message: string): void {
  const logs = getLogs();
  logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
  });
  if (logs.length > 200) logs.pop();
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// Stats
export function getStats(): ServerStats {
  const db = getDB();
  const totalRows = db.tables.reduce((acc, t) => acc + t.rows.length, 0);
  return {
    uptime: Math.floor(Math.random() * 86400) + 3600,
    requestsTotal: Math.floor(Math.random() * 50000) + 10000,
    requestsPerMinute: Math.floor(Math.random() * 120) + 20,
    activeConnections: Math.floor(Math.random() * 30) + 5,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
    cpuUsage: Math.floor(Math.random() * 25) + 5,
    dbSize: totalRows * 2.4 + 12,
    avgResponseTime: Math.floor(Math.random() * 30) + 8,
  };
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}д ${h}ч ${m}м`;
  if (h > 0) return `${h}ч ${m}м`;
  return `${m}м`;
}

export function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}
