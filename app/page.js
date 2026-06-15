'use client'

import { useState, useEffect, useCallback } from 'react'

function MonitorIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
}

function ExclamationIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}

function PencilIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function Spinner({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-surface-card border border-slate-700 rounded-xl overflow-hidden animate-pulse">
      <div className="px-5 py-4 bg-slate-700/50">
        <div className="h-5 bg-slate-600 rounded w-3/4" />
        <div className="h-3 bg-slate-600 rounded w-1/4 mt-1.5" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 bg-slate-700 rounded-lg" />
          <div className="h-14 bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ online }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      online ? 'bg-accent/15 text-accent' : 'bg-red-900/30 text-red-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-accent' : 'bg-red-400'}`} />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}

export default function Dashboard() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addTab, setAddTab] = useState('http')
  const [addName, setAddName] = useState('')
  const [addUrl, setAddUrl] = useState('')
  const [addMode, setAddMode] = useState({ cpu: true, ram: true, system: true, network: true })
  const [addInterval, setAddInterval] = useState(30)
  const [addCopyText, setAddCopyText] = useState('')

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

  const filtered = filter === 'all' ? targets : targets.filter(t => t.type === filter)

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Header ── */}
      <header className="bg-surface-card border-b border-slate-700 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MonitorIcon className="w-7 h-7 text-accent" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-50">Web Monitor</h1>
              <p className="text-xs text-slate-400">{targets.length} target(s) monitored</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Add Target</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-10 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Filter Tabs ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="flex gap-1.5">
          {['all', 'http', 'agent'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`h-9 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer capitalize ${
                filter === t
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-surface-card text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-slate-700'
              }`}
            >
              {t === 'all' ? 'All' : t === 'http' ? 'HTTP' : 'Agent'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center">
            <ExclamationIcon className="w-10 h-10 mx-auto text-red-400" />
            <p className="text-red-300 font-medium mt-3">Error: {error}</p>
            <button
              onClick={fetchTargets}
              className="mt-4 h-10 px-5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface-card border border-slate-700 rounded-xl p-12 text-center">
            <MonitorIcon className="w-14 h-14 mx-auto text-slate-600" />
            <p className="text-slate-300 font-semibold text-lg mt-4">No targets yet</p>
            <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
              {filter === 'http'
                ? 'Click "+ Add Target" to monitor an HTTP endpoint.'
                : filter === 'agent'
                ? 'Agent targets appear when they send their first status update.'
                : 'Add HTTP targets or connect agents to start monitoring.'}
            </p>
            {filter !== 'agent' && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-6 h-11 px-6 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Target
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((target) => (
              <div
                key={target.id}
                onClick={() => handleCardClick(target)}
                className="bg-surface-card border border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-600 transition-all duration-200 cursor-pointer active:shadow-md"
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

      {/* ── Detail Modal ── */}
      {selected && (
        <DetailModal
          target={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { handleEdit(selected); setSelected(null) }}
          onDelete={() => { setConfirmDelete(selected); setSelected(null) }}
        />
      )}

      {/* ── Edit Modal ── */}
      {editing && (
        <ModalOverlay onClose={() => setEditing(null)}>
          <div className="bg-surface-card rounded-2xl max-w-md w-full shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-700">
              <h2 className="text-lg font-bold text-slate-50">Edit Target</h2>
              <p className="text-sm text-slate-400 font-mono mt-0.5">ID: {editing.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Name</label>
                <input type="text" value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-200"
                  placeholder="Target name" />
              </div>
              {editing.type === 'http' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">URL</label>
                  <input type="text" value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-200"
                    placeholder="https://example.com" />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
              <button onClick={() => setEditing(null)}
                className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all duration-200 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveEdit}
                className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-200 cursor-pointer">
                Save
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <ModalOverlay onClose={() => setConfirmDelete(null)}>
          <div className="bg-surface-card rounded-2xl max-w-sm w-full shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto bg-red-900/30 rounded-full flex items-center justify-center">
                <ExclamationIcon className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-50 mt-4">Delete Target?</h2>
              <p className="text-sm text-slate-400 mt-2">
                Delete <strong className="text-slate-200">{confirmDelete.name || confirmDelete.id}</strong>?
                <br />This will remove all data and history.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all duration-200 cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 h-11 bg-danger hover:bg-danger-hover text-white font-bold rounded-xl transition-all duration-200 cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Add Target Modal ── */}
      {showAdd && (
        <ModalOverlay onClose={() => setShowAdd(false)}>
          <div className="bg-surface-card rounded-2xl max-w-lg w-full shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button onClick={() => { setAddTab('http'); setAddCopyText('') }}
                className={`flex-1 h-11 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  addTab === 'http'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>HTTP</button>
              <button onClick={() => { setAddTab('agent'); setAddCopyText('') }}
                className={`flex-1 h-11 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  addTab === 'agent'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>Agent</button>
            </div>

            {addTab === 'http' ? (
              <>
                <div className="px-6 py-5 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-slate-50">Add HTTP Target</h2>
                  <p className="text-sm text-slate-400">Monitor an HTTP/HTTPS endpoint</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Name</label>
                    <input type="text" value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-200"
                      placeholder="e.g. My Website" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">URL</label>
                    <input type="url" value={addUrl}
                      onChange={(e) => setAddUrl(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-200"
                      placeholder="https://example.com" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
                  <button onClick={() => setShowAdd(false)}
                    className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all duration-200 cursor-pointer">Cancel</button>
                  <button onClick={handleAddTarget}
                    className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-200 cursor-pointer">Add</button>
                </div>
              </>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-slate-50">Add Agent Target</h2>
                  <p className="text-sm text-slate-400">Copy this command to your Linux machine to monitor it</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Name / ID</label>
                    <input type="text" value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-200"
                      placeholder="e.g. my-server-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Monitor Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { k: 'cpu', label: 'CPU' },
                        { k: 'ram', label: 'RAM' },
                        { k: 'system', label: 'System' },
                        { k: 'network', label: 'Network' },
                      ].map(({ k, label }) => (
                        <label key={k}
                          className={`flex items-center gap-2 px-4 h-10 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all duration-200 ${
                            addMode[k]
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-slate-600 text-slate-400 hover:border-slate-500'
                          }`}>
                          <input type="checkbox" checked={addMode[k]}
                            onChange={() => setAddMode({ ...addMode, [k]: !addMode[k] })}
                            className="sr-only" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Interval (seconds)</label>
                    <input type="number" value={addInterval}
                      onChange={(e) => setAddInterval(Math.max(10, Number(e.target.value)))}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-200" />
                  </div>

                  {/* Generated Command */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Command to run on target</label>
                    <div className="relative">
                      <pre className="bg-slate-900 border border-slate-600 rounded-xl p-4 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap select-all">
                        {addCopyText || 'Fill in name and click "Generate"'}
                      </pre>
                      {addCopyText && (
                        <button onClick={() => {
                          navigator.clipboard.writeText(addCopyText)
                          setAddCopyText(addCopyText)
                        }}
                          className="absolute top-2 right-2 h-8 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer">
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
                  <button onClick={() => setShowAdd(false)}
                    className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all duration-200 cursor-pointer">Cancel</button>
                  <button onClick={() => {
                      const name = addName.trim() || `agent-${Date.now().toString(36)}`
                      const id = name.toLowerCase().replace(/\s+/g, '-')
                      const mode = Object.entries(addMode).filter(([,v]) => v).map(([k]) => k).join(',')
                      const cmd = `curl -sL https://monitor.box-dex.win/api/agent/script | python3 - \\
  --id=${id} \\
  --name="${name}" \\
  --server=https://monitor.box-dex.win \\
  --mode=${mode} \\
  --interval=${addInterval}`
                      setAddCopyText(cmd)
                      setAddName(name)
                    }}
                    className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-200 cursor-pointer">Generate</button>
                </div>
              </>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ── Modal Overlay ──
function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      {children}
    </div>
  )
}

// ── HTTP Target Card ──
function HttpCard({ target }) {
  const isOnline = target.status === 'online'
  return (
    <>
      <div className={`px-5 py-4 border-b border-slate-700 ${
        isOnline ? 'bg-gradient-to-r from-accent/20 to-transparent' : ''
      }`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-50 truncate">
            {target.name || target.url}
          </h2>
          <StatusBadge online={isOnline} />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="text-xs text-slate-500 font-mono truncate" title={target.url}>
          {target.url}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-slate-200 font-mono">
              {target.response_time_ms ? `${target.response_time_ms}ms` : '--'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Response</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-slate-200 font-mono">
              {target.status_code || '--'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Status</div>
          </div>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-slate-600">
            {target.last_check
              ? new Date(target.last_check).toLocaleString('th-TH')
              : 'No checks yet'}
          </span>
        </div>
      </div>
    </>
  )
}

// ── Agent Target Card ──
function AgentCard({ target }) {
  const isOnline = target.status === 'online'
  return (
    <>
      <div className={`px-5 py-4 border-b border-slate-700 ${
        isOnline ? 'bg-gradient-to-r from-accent/20 to-transparent' : ''
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-50 truncate">
              {target.name || `Agent #${target.id}`}
            </h2>
            {target.location && (
              <p className="text-accent text-xs mt-0.5 truncate">{target.location}</p>
            )}
          </div>
          <StatusBadge online={isOnline} />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {target.status_tank != null && (
          <div className="text-center py-1">
            <div className="text-2xl font-bold text-accent font-mono">{target.status_tank}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">cm</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-slate-200 font-mono">{target.cpu_percent || 0}%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">CPU</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-slate-200 font-mono">{target.ram_percent || 0}%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">RAM</div>
          </div>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-slate-600">
            {target.last_update
              ? new Date(target.last_update).toLocaleString('th-TH')
              : 'No data'}
          </span>
        </div>
      </div>
    </>
  )
}

// ── Detail Modal ──
function DetailModal({ target, onClose, onEdit, onDelete }) {
  const isOnline = target.status === 'online'

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-700">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-50 truncate">
              {target.name || target.id}
            </h2>
            <p className="text-sm text-slate-400 truncate mt-0.5">
              {target.type === 'http' ? target.url : (target.location || target.type)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge online={isOnline} />
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-all duration-200 cursor-pointer">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {target._loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : target.type === 'http' ? (
            <HttpDetail target={target} />
          ) : (
            <AgentDetail target={target} />
          )}

          {/* Last update */}
          <div className="text-center text-xs text-slate-600 border-t border-slate-700 pt-4">
            {target.last_check
              ? `Last check: ${new Date(target.last_check).toLocaleString('th-TH')}`
              : 'No checks yet'}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-700 pt-4">
            <button onClick={onEdit}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-200 cursor-pointer">
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
            <button onClick={onDelete}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-danger hover:bg-danger-hover text-white font-bold rounded-xl transition-all duration-200 cursor-pointer">
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── HTTP Detail ──
function HttpDetail({ target }) {
  const rt = target.response_time_ms || 0
  const rtBar = Math.min(rt / 20, 100)

  return (
    <>
      <div className="bg-slate-800/50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Response Time</span>
          <span className="text-2xl font-bold text-slate-50 font-mono">{rt}ms</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-500 ${
            rt > 1000 ? 'bg-danger' : 'bg-accent'
          }`} style={{ width: `${rtBar}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Status Code</div>
          <div className={`text-xl font-bold font-mono mt-1 ${
            target.status_code >= 200 && target.status_code < 300 ? 'text-accent' : 'text-danger'
          }`}>
            {target.status_code || '--'}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Method</div>
          <div className="text-xl font-bold text-slate-50 font-mono mt-1">{target.method || 'GET'}</div>
        </div>
      </div>

      {target.error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
          <div className="text-[10px] text-red-400 uppercase tracking-wider">Error</div>
          <div className="text-sm text-red-300 font-mono mt-1 break-all">{target.error}</div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">URL</div>
        <div className="text-sm text-slate-300 font-mono mt-1 break-all">{target.url}</div>
      </div>
    </>
  )
}

// ── Agent Detail ──
function AgentDetail({ target }) {
  return (
    <>
      {target.status_tank != null && (
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-5xl font-bold text-accent font-mono">{target.status_tank}</div>
          <div className="text-sm text-slate-400 mt-1">centimeters</div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">System Resources</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-slate-400">CPU</span>
              <span className="text-sm font-bold text-slate-200 font-mono">{target.cpu_percent || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${
                (target.cpu_percent || 0) > 80 ? 'bg-danger' : 'bg-accent'
              }`} style={{ width: `${Math.min(target.cpu_percent || 0, 100)}%` }} />
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-slate-400">RAM</span>
              <span className="text-sm font-bold text-slate-200 font-mono">{target.ram_percent || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${
                (target.ram_percent || 0) > 80 ? 'bg-danger' : 'bg-accent'
              }`} style={{ width: `${Math.min(target.ram_percent || 0, 100)}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-1.5 font-mono">
              {target.ram_used_mb || 0} / {target.ram_total_mb || 0} MB
            </div>
          </div>
        </div>
      </div>

      {target.processes && target.processes.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Running Processes</h3>
          <div className="space-y-2">
            {target.processes.map((proc, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">
                    {proc.pid ? `PID ${proc.pid}` : `#${idx + 1}`}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    proc.status === 'running' ? 'bg-accent/15 text-accent' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {proc.status || 'running'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono truncate" title={proc.cmd || proc}>
                  {proc.cmd || proc}
                </div>
                {proc.cpu != null && (
                  <div className="flex gap-4 mt-1.5 text-xs text-slate-500 font-mono">
                    <span>CPU: {proc.cpu}%</span>
                    <span>RAM: {proc.ram}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {target.hardware && Object.keys(target.hardware).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Hardware</h3>
          <div className="grid grid-cols-3 gap-2">
            {['serial_connected', 'camera_ready', 'sensor_ready'].map((k) => (
              <div key={k} className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  target.hardware[k] ? 'bg-accent' : 'bg-danger'
                }`} />
                <span className="text-xs text-slate-400 capitalize truncate">
                  {k.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {target.network && Object.keys(target.network).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Network</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2.5">
              <span className={`w-2 h-2 rounded-full ${
                target.network.internet_ok !== false ? 'bg-accent' : 'bg-danger'
              }`} />
              <span className="text-xs text-slate-400">
                Internet {target.network.internet_ok !== false ? 'OK' : 'DOWN'}
              </span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2.5">
              <span className="text-xs text-slate-400">
                WiFi: {target.network.wifi_ssid || target.network.ssid || 'N/A'}
              </span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2.5">
              <span className="text-xs text-slate-400">
                Ping: {target.network.latency_ms ? `${target.network.latency_ms}ms` : 'N/A'}
              </span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2.5">
              <span className="text-xs text-slate-400">
                RX: {target.network.recv_month_mb || 0} MB
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
