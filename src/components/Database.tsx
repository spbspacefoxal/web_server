import React, { useState, useEffect } from 'react';
import { getDB, addTable, deleteTable, addRow, deleteRow, updateRow, saveDB } from '../db';
import type { DBTable } from '../db';

export default function Database() {
  const [tables, setTables] = useState<DBTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newColumns, setNewColumns] = useState('');
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string>('');
  const [showQueryPanel, setShowQueryPanel] = useState(false);

  useEffect(() => {
    refreshTables();
  }, []);

  function refreshTables() {
    const db = getDB();
    setTables(db.tables);
  }

  function handleCreateTable() {
    if (!newTableName.trim()) return;
    const columns = newColumns.split(',').map(c => c.trim()).filter(c => c);
    if (columns.length === 0) return;
    addTable(newTableName.trim(), columns);
    setNewTableName('');
    setNewColumns('');
    setShowCreateTable(false);
    refreshTables();
  }

  function handleDeleteTable(name: string) {
    if (confirm(`Удалить таблицу "${name}"?`)) {
      deleteTable(name);
      if (selectedTable === name) setSelectedTable(null);
      refreshTables();
    }
  }

  function handleAddRow() {
    if (!selectedTable) return;
    addRow(selectedTable, newRowData);
    setNewRowData({});
    setShowAddRow(false);
    refreshTables();
  }

  function handleDeleteRow(rowId: number) {
    if (!selectedTable) return;
    deleteRow(selectedTable, rowId);
    refreshTables();
  }

  function handleSaveEdit(rowId: number) {
    if (!selectedTable) return;
    updateRow(selectedTable, rowId, editData);
    setEditingRow(null);
    setEditData({});
    refreshTables();
  }

  function executeQuery() {
    const query = queryResult.trim().toLowerCase();
    if (query.startsWith('select')) {
      const match = query.match(/from\s+(\w+)/);
      if (match) {
        const tableName = match[1];
        const table = tables.find(t => t.name === tableName);
        if (table) {
          setQueryResult(`-- Результат: ${table.rows.length} записей из "${tableName}"\n${JSON.stringify(table.rows, null, 2)}`);
        } else {
          setQueryResult(`-- Ошибка: таблица "${tableName}" не найдена`);
        }
      }
    } else if (query.startsWith('show tables')) {
      setQueryResult(tables.map(t => t.name).join('\n'));
    } else {
      setQueryResult('-- Выполнено. Запрос обработан.');
    }
  }

  const currentTable = tables.find(t => t.name === selectedTable);
  const filteredRows = currentTable?.rows.filter(row =>
    searchQuery === '' || Object.values(row).some(v =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  return (
    <div className="animate-slide-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🗄 Управление базой данных</h2>
          <p className="text-slate-400 text-sm mt-1">SQLite • {tables.length} таблиц • {tables.reduce((a, t) => a + t.rows.length, 0)} записей</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQueryPanel(!showQueryPanel)}
            className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
          >
            💻 SQL Консоль
          </button>
          <button
            onClick={() => setShowCreateTable(true)}
            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 border border-green-500/30 transition-all"
          >
            + Новая таблица
          </button>
        </div>
      </div>

      {/* SQL Console */}
      {showQueryPanel && (
        <div className="glass-card rounded-xl p-6 animate-slide-in">
          <h3 className="text-lg font-semibold mb-3">SQL Консоль</h3>
          <textarea
            value={queryResult}
            onChange={e => setQueryResult(e.target.value)}
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-sm text-green-400 resize-none focus:outline-none focus:border-indigo-500"
            placeholder="SELECT * FROM users;  или  SHOW TABLES;"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={executeQuery}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
            >
              ▶ Выполнить
            </button>
            <button
              onClick={() => setQueryResult('')}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-all"
            >
              Очистить
            </button>
          </div>
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateTable && (
        <div className="glass-card rounded-xl p-6 animate-slide-in">
          <h3 className="text-lg font-semibold mb-4">Создать таблицу</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Имя таблицы</label>
              <input
                type="text"
                value={newTableName}
                onChange={e => setNewTableName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="my_table"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Колонки (через запятую)</label>
              <input
                type="text"
                value={newColumns}
                onChange={e => setNewColumns(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="name, email, age, created_at"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTable}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
              >
                Создать
              </button>
              <button
                onClick={() => setShowCreateTable(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table List */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Таблицы</h3>
            <div className="space-y-1">
              {tables.map(table => (
                <div
                  key={table.name}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                    selectedTable === table.name
                      ? 'bg-indigo-500/20 border border-indigo-500/30'
                      : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedTable(table.name)}
                >
                  <div>
                    <p className="text-sm font-medium">{table.name}</p>
                    <p className="text-xs text-slate-400">{table.rows.length} rows</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteTable(table.name); }}
                    className="text-red-400/60 hover:text-red-400 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="lg:col-span-3">
          {currentTable ? (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">📋 {currentTable.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Колонки: {currentTable.columns.join(', ')} • Создана: {new Date(currentTable.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const cols = currentTable.columns.filter(c => c !== 'id');
                    const initial: Record<string, string> = {};
                    cols.forEach(c => initial[c] = '');
                    setNewRowData(initial);
                    setShowAddRow(true);
                  }}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 border border-green-500/30 transition-all"
                >
                  + Добавить запись
                </button>
              </div>

              {/* Add Row Form */}
              {showAddRow && (
                <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-slide-in">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(newRowData).map(col => (
                      <div key={col}>
                        <label className="text-xs text-slate-400 block mb-1">{col}</label>
                        <input
                          type="text"
                          value={newRowData[col] || ''}
                          onChange={e => setNewRowData({ ...newRowData, [col]: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddRow} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                      Сохранить
                    </button>
                    <button onClick={() => setShowAddRow(false)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600">
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="🔍 Поиск по таблице..."
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {currentTable.columns.map(col => (
                        <th key={col} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          {col}
                        </th>
                      ))}
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map(row => (
                      <tr key={row.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        {currentTable.columns.map(col => (
                          <td key={col} className="py-2 px-3">
                            {editingRow === row.id ? (
                              <input
                                type="text"
                                value={editData[col] ?? row[col]}
                                onChange={e => setEditData({ ...editData, [col]: e.target.value })}
                                className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm w-full focus:outline-none"
                              />
                            ) : (
                              <span className={typeof row[col] === 'boolean' ? (row[col] ? 'text-green-400' : 'text-red-400') : ''}>
                                {String(row[col])}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right">
                          {editingRow === row.id ? (
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => handleSaveEdit(row.id)} className="text-green-400 hover:text-green-300 text-xs px-2">✓</button>
                              <button onClick={() => setEditingRow(null)} className="text-slate-400 hover:text-slate-300 text-xs px-2">✕</button>
                            </div>
                          ) : (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => { setEditingRow(row.id); setEditData({ ...row }); }}
                                className="text-blue-400 hover:text-blue-300 text-xs px-2"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="text-red-400 hover:text-red-300 text-xs px-2"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRows.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Нет записей</p>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <p className="text-4xl mb-4">🗄</p>
              <p className="text-slate-400">Выберите таблицу для просмотра</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
