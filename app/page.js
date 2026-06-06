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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ON':
        return 'bg-green-500'
      case 'OFF':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ON':
        return 'Online'
      case 'OFF':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bottle Refund Monitor
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>

        {machines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No machines registered yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Kiosks will appear here once they send their first status update.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <div
                key={machine.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Machine #{machine.id}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(
                      machine.status_machine
                    )}`}
                  >
                    {getStatusText(machine.status_machine)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{machine.status_machine}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">State:</span>
                    <span className="font-medium text-green-600">{machine.state || 'running'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tank Distance:</span>
                    <span className="font-medium">
                      {machine.status_tank ? `${machine.status_tank} cm` : 'N/A'}
                    </span>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">CPU:</span>
                      <span className="font-medium">{machine.cpu_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (machine.cpu_percent || 0) > 80
                            ? 'bg-red-500'
                            : (machine.cpu_percent || 0) > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${machine.cpu_percent || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">RAM:</span>
                      <span className="font-medium">
                        {machine.ram_used_mb || 0} / {machine.ram_total_mb || 0} MB ({machine.ram_percent || 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (machine.ram_percent || 0) > 80
                            ? 'bg-red-500'
                            : (machine.ram_percent || 0) > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${machine.ram_percent || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between border-t pt-3 mt-3">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium text-sm">
                      {new Date(machine.last_update).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>

                {/* Running Processes */}
                {machine.processes && machine.processes.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Running Scripts</h3>
                    <div className="space-y-2">
                      {machine.processes.map((proc, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">PID {proc.pid}</span>
                            <span className={`px-2 py-0.5 rounded text-white text-xs ${
                              proc.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {proc.status}
                            </span>
                          </div>
                          <div className="text-gray-500 truncate" title={proc.cmd}>
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

                {/* Hardware Status */}
                {machine.hardware && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Hardware</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <div className={`w-2 h-2 rounded-full ${machine.hardware.serial_connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-700">Serial ({machine.hardware.serial_port || 'N/A'})</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <div className={`w-2 h-2 rounded-full ${machine.hardware.camera_ready ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-700">Camera</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <div className={`w-2 h-2 rounded-full ${machine.hardware.sensor_ready ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-700">Sensor</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
