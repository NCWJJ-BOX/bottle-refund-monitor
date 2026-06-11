'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines')
      if (!response.ok) throw new Error('Failed to fetch machines')
      const data = await response.json()
      setMachines(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetail = async (id) => {
    try {
      const res = await fetch(`/api/machines/${encodeURIComponent(id)}`)
      if (res.ok) return await res.json()
    } catch {}
    return null
  }

  const handleCardClick = async (machine) => {
    setSelected({ ...machine, _loading: true })
    const detail = await fetchDetail(machine.id)
    if (detail) {
      setSelected(detail)
    } else {
      setSelected(machine)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/machines?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMachines((prev) => prev.filter((m) => m.id !== id))
        setConfirmDelete(null)
        setSelected(null)
      }
    } catch (err) {
      alert('Delete failed')
    }
  }

  const handleEdit = (machine) => {
    setEditing(machine)
    setEditName(machine.name || '')
    setEditLocation(machine.location || '')
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          name: editName,
          location: editLocation,
        }),
      })
      if (res.ok) {
        setMachines((prev) =>
          prev.map((m) =>
            m.id === editing.id ? { ...m, name: editName, location: editLocation } : m
          )
        )
        setEditing(null)
        if (selected?.id === editing.id) {
          setSelected((prev) => ({ ...prev, name: editName, location: editLocation }))
        }
      }
    } catch (err) {
      alert('Save failed')
    }
  }

  useEffect(() => {
    fetchMachines()
    const interval = setInterval(fetchMachines, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-green-700 font-medium">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bottle Refund Monitor</h1>
            <p className="text-green-200 text-sm">{machines.length} kiosk(s) registered</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {machines.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-800 font-medium text-lg">No machines registered yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Kiosks will appear here once they send their first status update.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {machines.map((machine) => (
              <div
                key={machine.id}
                onClick={() => handleCardClick(machine)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer hover:border-green-400 active:scale-[0.98]"
              >
                {/* Card Header */}
                <div className={`px-5 py-4 flex items-center justify-between ${
                  machine.status_machine === 'ON'
                    ? 'bg-gradient-to-r from-green-600 to-green-700'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {machine.name || `Machine #${machine.id}`}
                    </h2>
                    {machine.location && (
                      <p className="text-green-100 text-xs mt-0.5">{machine.location}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    machine.status_machine === 'ON'
                      ? 'bg-white text-green-700'
                      : 'bg-red-500 text-white'
                  }`}>
                    {machine.status_machine === 'ON' ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {/* Tank Level */}
                  <div className="text-center py-2">
                    <div className="text-3xl font-bold text-green-700">
                      {machine.status_tank ? `${machine.status_tank}` : '--'}
                    </div>
                    <div className="text-xs text-gray-500">{machine.status_tank ? 'cm' : 'No data'}</div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-800">{machine.cpu_percent || 0}%</div>
                      <div className="text-xs text-gray-500">CPU</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-800">{machine.ram_percent || 0}%</div>
                      <div className="text-xs text-gray-500">RAM</div>
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="text-center">
                    <span className="text-xs text-gray-400">
                      {new Date(machine.last_update).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-6 py-5 flex items-center justify-between ${
              selected.status_machine === 'ON'
                ? 'bg-gradient-to-r from-green-600 to-green-700'
                : 'bg-gradient-to-r from-gray-500 to-gray-600'
            } rounded-t-2xl`}>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selected.name || `Machine #${selected.id}`}
                </h2>
                {selected.location && (
                  <p className="text-green-100 text-sm">{selected.location}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selected.status_machine === 'ON'
                    ? 'bg-white text-green-700'
                    : 'bg-red-500 text-white'
                }`}>
                  {selected.status_machine === 'ON' ? 'Online' : 'Offline'}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="text-white/80 hover:text-white text-2xl ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Tank Level */}
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-5xl font-bold text-green-700">
                  {selected.status_tank ? `${selected.status_tank}` : '--'}
                </div>
                <div className="text-sm text-green-600 mt-1">{selected.status_tank ? 'centimeters' : 'No tank data'}</div>
              </div>

              {/* System Resources */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">System Resources</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">CPU</span>
                      <span className="text-sm font-bold text-gray-800">{selected.cpu_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${(selected.cpu_percent || 0) > 80 ? 'bg-red-500' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(selected.cpu_percent || 0, 100)}%` }} />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">RAM</span>
                      <span className="text-sm font-bold text-gray-800">{selected.ram_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${(selected.ram_percent || 0) > 80 ? 'bg-red-500' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(selected.ram_percent || 0, 100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selected.ram_used_mb || 0} / {selected.ram_total_mb || 0} MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Processes */}
              {selected.processes && selected.processes.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Running Processes</h3>
                  <div className="space-y-2">
                    {selected.processes.map((proc, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 text-sm">PID {proc.pid}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            proc.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {proc.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-mono truncate" title={proc.cmd}>
                          {proc.cmd}
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-600">
                          <span>CPU: {proc.cpu}%</span>
                          <span>RAM: {proc.ram}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hardware */}
              {selected.hardware && Object.keys(selected.hardware).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Hardware</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selected.hardware.serial_connected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-700">Serial</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selected.hardware.camera_ready ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-700">Camera</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selected.hardware.sensor_ready ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-700">Sensor</span>
                    </div>
                  </div>
                  {selected.hardware.serial_port && (
                    <div className="text-xs text-gray-500 mt-2">Port: {selected.hardware.serial_port}</div>
                  )}
                </div>
              )}

              {/* Network */}
              {selected.network && Object.keys(selected.network).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Network</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selected.network.internet_ok ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-700">Internet {selected.network.internet_ok ? 'OK' : 'DOWN'}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-xs text-gray-700">WiFi: {selected.network.wifi_ssid || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-xs text-gray-700">Ping: {selected.network.latency_ms ? `${selected.network.latency_ms}ms` : 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-xs text-gray-700">TX: {selected.network.sent_month_mb || 0} MB</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-xs text-gray-700">RX: {selected.network.recv_month_mb || 0} MB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Update */}
              <div className="text-center text-xs text-gray-400 border-t pt-3">
                Last update: {new Date(selected.last_update).toLocaleString('th-TH')}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t pt-4">
                <button
                  onClick={() => handleEdit(selected)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(selected)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Edit Machine</h2>
              <p className="text-sm text-gray-500">ID: {editing.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none transition"
                  placeholder="e.g. Kiosk A"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none transition"
                  placeholder="e.g. Floor 1, Entrance"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-gray-800">Delete Machine?</h2>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <strong>{confirmDelete.name || `Machine #${confirmDelete.id}`}</strong>?
                <br />This will remove all data and history.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
