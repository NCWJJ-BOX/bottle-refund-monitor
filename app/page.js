'use client'

import { useState, useEffect, useCallback } from 'react'

export default function Dashboard() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'http' | 'agent'
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addUrl, setAddUrl] = useState('')

  const fetchTargets = useCallback(async () => {
    try {
      const typeParam = filter !== 'all' ? `?type=${filter}` : ''
      const response = await fetch(`/api/targets${typeParam}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTargets(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filter])

  const fetchDetail = async (id) => {
    try {
      const res = await fetch(`/api/targets/${encodeURIComponent(id)}`)
      if (res.ok) return await res.json()
    } catch {}
    return null
  }

  const handleCardClick = async (target) => {
    setSelected({ ...target, _loading: true })
    const detail = await fetchDetail(target.id)
    setSelected(detail || target)
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/targets/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        setTargets((prev) => prev.filter((t) => t.id !== id))
        setConfirmDelete(null)
        setSelected(null)
      }
    } catch { alert('Delete failed') }
  }

  const handleEdit = (target) => {
    setEditing(target)
    setEditName(target.name || '')
    setEditUrl(target.url || '')
  }

  const handleSaveEdit = async () => {
    try {
      const body = { name: editName }
      if (editing.type === 'http') body.url = editUrl

      const res = await fetch(`/api/targets/${encodeURIComponent(editing.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setTargets((prev) =>
          prev.map((t) =>
            t.id === editing.id ? { ...t, name: editName, url: editUrl || t.url } : t
          )
        )
        setEditing(null)
        if (selected?.id === editing.id) {
          setSelected((prev) => ({ ...prev, name: editName, url: editUrl || prev.url }))
        }
      }
    } catch { alert('Save failed') }
  }

  const handleAddTarget = async () => {
    if (!addName || !addUrl) return
    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'http', name: addName, url: addUrl }),
      })
      if (res.ok) {
        setShowAdd(false)
        setAddName('')
        setAddUrl('')
        fetchTargets()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add target')
      }
    } catch { alert('Failed to add target') }
  }

  useEffect(() => {
    fetchTargets()
    const interval = setInterval(fetchTargets, 10000)
    return () => clearInterval(interval)
  }, [fetchTargets])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-indigo-400 font-medium">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    )
  }

  const filtered = filter === 'all' ? targets : targets.filter(t => t.type === filter)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Web Monitor</h1>
            <p className="text-indigo-200 text-sm">{targets.length} target(s) monitored</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
            >
              + Add Target
            </button>
            <button
              onClick={handleLogout}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-2">
        <div className="flex gap-2">
          {['all', 'http', 'agent'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${
                filter === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t === 'all' ? 'All' : t === 'http' ? 'HTTP' : 'Agent'}
            </button>
          ))}
        </div>
      </div>

      {/* Target Grid */}
      <div className="max-w-7xl mx-auto p-8">
        {filtered.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-300 font-medium text-lg">No targets yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              {filter === 'http'
                ? 'Click "+ Add Target" to monitor an HTTP endpoint.'
                : filter === 'agent'
                ? 'Agent targets appear when they send their first status update.'
                : 'Add HTTP targets or connect agents to start monitoring.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((target) => (
              <div
                key={target.id}
                onClick={() => handleCardClick(target)}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer hover:border-indigo-500 active:scale-[0.98]"
              >
                {target.type === 'http' ? (
                  <HttpCard target={target} />
                ) : (
                  <AgentCard target={target} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          target={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { handleEdit(selected); setSelected(null) }}
          onDelete={() => { setConfirmDelete(selected); setSelected(null) }}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(null)}>
          <div className="bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Edit Target</h2>
              <p className="text-sm text-gray-400">ID: {editing.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Name</label>
                <input type="text" value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-indigo-500 outline-none transition"
                  placeholder="Target name" />
              </div>
              {editing.type === 'http' && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">URL</label>
                  <input type="text" value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-indigo-500 outline-none transition"
                    placeholder="https://example.com" />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
              <button onClick={() => setEditing(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 px-4 rounded-lg transition">
                Cancel
              </button>
              <button onClick={handleSaveEdit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmDelete(null)}>
          <div className="bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-white">Delete Target?</h2>
              <p className="text-sm text-gray-400 mt-2">
                Delete <strong className="text-white">{confirmDelete.name || confirmDelete.id}</strong>?
                <br />This will remove all data and history.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 px-4 rounded-lg transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Target Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdd(false)}>
          <div className="bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Add HTTP Target</h2>
              <p className="text-sm text-gray-400">Monitor an HTTP/HTTPS endpoint</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Name</label>
                <input type="text" value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. My Website" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">URL</label>
                <input type="url" value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-indigo-500 outline-none transition"
                  placeholder="https://example.com" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 px-4 rounded-lg transition">
                Cancel
              </button>
              <button onClick={handleAddTarget}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── HTTP Target Card ────────────────────────────────────────────────
function HttpCard({ target }) {
  const isOnline = target.status === 'online'
  return (
    <>
      <div className={`px-5 py-4 ${
        isOnline
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
          : 'bg-gradient-to-r from-red-600 to-red-700'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white truncate mr-2">
            {target.name || target.url}
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
            isOnline ? 'bg-white text-emerald-700' : 'bg-red-600 text-white'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="text-sm text-gray-400 font-mono truncate" title={target.url}>
          {target.url}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-gray-200">
              {target.response_time_ms ? `${target.response_time_ms}ms` : '--'}
            </div>
            <div className="text-xs text-gray-500">Response</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-gray-200">
              {target.status_code || '--'}
            </div>
            <div className="text-xs text-gray-500">Status</div>
          </div>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">
            {target.last_check
              ? new Date(target.last_check).toLocaleString('th-TH')
              : 'No checks yet'}
          </span>
        </div>
      </div>
    </>
  )
}

// ── Agent Target Card ───────────────────────────────────────────────
function AgentCard({ target }) {
  const isOnline = target.status === 'online'
  return (
    <>
      <div className={`px-5 py-4 flex items-center justify-between ${
        isOnline
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
          : 'bg-gradient-to-r from-gray-500 to-gray-600'
      }`}>
        <div>
          <h2 className="text-lg font-bold text-white">
            {target.name || `Agent #${target.id}`}
          </h2>
          {target.location && (
            <p className="text-emerald-100 text-xs mt-0.5">{target.location}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isOnline ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="p-4 space-y-3">
        {target.status_tank != null && (
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-emerald-400">{target.status_tank}</div>
            <div className="text-xs text-gray-500">cm</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-gray-200">{target.cpu_percent || 0}%</div>
            <div className="text-xs text-gray-500">CPU</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-gray-200">{target.ram_percent || 0}%</div>
            <div className="text-xs text-gray-500">RAM</div>
          </div>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">
            {target.last_update
              ? new Date(target.last_update).toLocaleString('th-TH')
              : 'No data'}
          </span>
        </div>
      </div>
    </>
  )
}

// ── Detail Modal ────────────────────────────────────────────────────
function DetailModal({ target, onClose, onEdit, onDelete }) {
  const isOnline = target.status === 'online'
  const gradient = isOnline
    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
    : 'bg-gradient-to-r from-red-600 to-red-700'
  const badgeClass = isOnline
    ? 'bg-white text-emerald-700'
    : 'bg-red-600 text-white'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between ${gradient} rounded-t-2xl`}>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {target.name || target.id}
            </h2>
            <p className="text-emerald-100 text-sm truncate">
              {target.type === 'http' ? target.url : (target.location || target.type)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${badgeClass}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button onClick={onClose}
              className="text-white/80 hover:text-white text-2xl ml-2">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {target.type === 'http' ? (
            <HttpDetail target={target} />
          ) : (
            <AgentDetail target={target} />
          )}

          {/* Last update */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-3">
            {target.last_check
              ? `Last check: ${new Date(target.last_check).toLocaleString('th-TH')}`
              : 'No checks yet'}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-700 pt-4">
            <button onClick={onEdit}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition">
              Edit
            </button>
            <button onClick={onDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HTTP Detail View ────────────────────────────────────────────────
function HttpDetail({ target }) {
  const rt = target.response_time_ms || 0
  const rtBar = Math.min(rt / 20, 100) // scale: 2000ms = 100%

  return (
    <>
      {/* Response time */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Response Time</span>
          <span className="text-2xl font-bold text-white">{rt}ms</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${rt > 1000 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${rtBar}%` }} />
        </div>
      </div>

      {/* Status info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Status Code</div>
          <div className={`text-xl font-bold ${target.status_code >= 200 && target.status_code < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
            {target.status_code || '--'}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Method</div>
          <div className="text-xl font-bold text-white">{target.method || 'GET'}</div>
        </div>
      </div>

      {/* Error */}
      {target.error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
          <div className="text-xs text-red-400">Error</div>
          <div className="text-sm text-red-300 font-mono mt-1">{target.error}</div>
        </div>
      )}

      {/* URL info */}
      <div className="bg-gray-700/50 rounded-lg p-3">
        <div className="text-xs text-gray-400">URL</div>
        <div className="text-sm text-gray-200 font-mono mt-1 break-all">{target.url}</div>
      </div>
    </>
  )
}

// ── Agent Detail View ───────────────────────────────────────────────
function AgentDetail({ target }) {
  return (
    <>
      {target.status_tank != null && (
        <div className="bg-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-5xl font-bold text-emerald-400">{target.status_tank}</div>
          <div className="text-sm text-gray-400 mt-1">centimeters</div>
        </div>
      )}

      {/* System Resources */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">System Resources</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">CPU</span>
              <span className="text-sm font-bold text-gray-200">{target.cpu_percent || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className={`h-2 rounded-full ${(target.cpu_percent || 0) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(target.cpu_percent || 0, 100)}%` }} />
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">RAM</span>
              <span className="text-sm font-bold text-gray-200">{target.ram_percent || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className={`h-2 rounded-full ${(target.ram_percent || 0) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(target.ram_percent || 0, 100)}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {target.ram_used_mb || 0} / {target.ram_total_mb || 0} MB
            </div>
          </div>
        </div>
      </div>

      {/* Processes */}
      {target.processes && target.processes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Running Processes</h3>
          <div className="space-y-2">
            {target.processes.map((proc, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-200 text-sm">
                    {proc.pid ? `PID ${proc.pid}` : `#${idx + 1}`}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    proc.status === 'running' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-gray-600 text-gray-400'
                  }`}>
                    {proc.status || 'running'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono truncate" title={proc.cmd || proc}>
                  {proc.cmd || proc}
                </div>
                {proc.cpu != null && (
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>CPU: {proc.cpu}%</span>
                    <span>RAM: {proc.ram}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hardware */}
      {target.hardware && Object.keys(target.hardware).length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Hardware</h3>
          <div className="grid grid-cols-3 gap-2">
            {['serial_connected', 'camera_ready', 'sensor_ready'].map((k) => (
              <div key={k} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  target.hardware[k] ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-400 capitalize">
                  {k.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network */}
      {target.network && Object.keys(target.network).length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Network</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                target.network.internet_ok !== false ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-400">
                Internet {target.network.internet_ok !== false ? 'OK' : 'DOWN'}
              </span>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <span className="text-xs text-gray-400">
                WiFi: {target.network.wifi_ssid || target.network.ssid || 'N/A'}
              </span>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <span className="text-xs text-gray-400">
                Ping: {target.network.latency_ms ? `${target.network.latency_ms}ms` : 'N/A'}
              </span>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <span className="text-xs text-gray-400">
                RX: {target.network.recv_month_mb || 0} MB
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
