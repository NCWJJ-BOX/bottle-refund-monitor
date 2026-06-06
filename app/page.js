'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines')
      if (!response.ok) {
        throw new Error('Failed to fetch machines')
      }
      const data = await response.json()
      setMachines(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  useEffect(() => {
    fetchMachines()
    const interval = setInterval(fetchMachines, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-green-700 font-medium">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-700 text-white px-8 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bottle Refund Monitor</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {machines.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <p className="text-green-800 font-medium">No machines registered yet.</p>
            <p className="text-sm text-green-600 mt-2">
              Kiosks will appear here once they send their first status update.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <div
                key={machine.id}
                className="bg-white border-2 border-green-600 rounded-lg overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Machine #{machine.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    machine.status_machine === 'ON'
                      ? 'bg-white text-green-700'
                      : 'bg-red-500 text-white'
                  }`}>
                    {machine.status_machine === 'ON' ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-bold text-green-700">{machine.status_machine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-bold text-green-700">{machine.state || 'running'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tank:</span>
                      <span className="font-bold text-green-700">
                        {machine.status_tank ? `${machine.status_tank} cm` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* CPU */}
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 text-sm">CPU</span>
                      <span className="font-bold text-green-700 text-sm">{machine.cpu_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: `${machine.cpu_percent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 text-sm">RAM</span>
                      <span className="font-bold text-green-700 text-sm">
                        {machine.ram_used_mb || 0} / {machine.ram_total_mb || 0} MB ({machine.ram_percent || 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: `${machine.ram_percent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Processes */}
                  {machine.processes && machine.processes.length > 0 && (
                    <div className="border-t border-green-200 pt-3">
                      <h3 className="text-sm font-bold text-green-700 mb-2">Scripts</h3>
                      <div className="space-y-2">
                        {machine.processes.map((proc, idx) => (
                          <div key={idx} className="bg-green-50 rounded-lg p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-800">PID {proc.pid}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                proc.status === 'running' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                              }`}>
                                {proc.status}
                              </span>
                            </div>
                            <div className="text-gray-500 truncate mt-1" title={proc.cmd}>
                              {proc.cmd}
                            </div>
                            <div className="flex gap-4 mt-1 text-gray-600">
                              <span>CPU: {proc.cpu}%</span>
                              <span>RAM: {proc.ram}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hardware */}
                  {machine.hardware && (
                    <div className="border-t border-green-200 pt-3">
                      <h3 className="text-sm font-bold text-green-700 mb-2">Hardware</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
                          <div className={`w-2 h-2 rounded-full ${machine.hardware.serial_connected ? 'bg-green-600' : 'bg-red-500'}`} />
                          <span className="text-xs text-gray-700">Serial ({machine.hardware.serial_port || 'N/A'})</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
                          <div className={`w-2 h-2 rounded-full ${machine.hardware.camera_ready ? 'bg-green-600' : 'bg-red-500'}`} />
                          <span className="text-xs text-gray-700">Camera</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
                          <div className={`w-2 h-2 rounded-full ${machine.hardware.sensor_ready ? 'bg-green-600' : 'bg-red-500'}`} />
                          <span className="text-xs text-gray-700">Sensor</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Network */}
                  {machine.network && (
                    <div className="border-t border-green-200 pt-3">
                      <h3 className="text-sm font-bold text-green-700 mb-2">Network</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
                          <div className={`w-2 h-2 rounded-full ${machine.network.internet_ok ? 'bg-green-600' : 'bg-red-500'}`} />
                          <span className="text-xs text-gray-700">Internet {machine.network.internet_ok ? 'OK' : 'DOWN'}</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <span className="text-xs text-gray-700">WiFi: {machine.network.wifi_ssid || 'N/A'}</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <span className="text-xs text-gray-700">Ping: {machine.network.latency_ms ? `${machine.network.latency_ms}ms` : 'N/A'}</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <span className="text-xs text-gray-700">TX: {machine.network.sent_month_mb || 0} MB</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <span className="text-xs text-gray-700">RX: {machine.network.recv_month_mb || 0} MB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Last Update */}
                  <div className="border-t border-green-200 pt-3 text-right">
                    <span className="text-xs text-gray-500">
                      {new Date(machine.last_update).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
