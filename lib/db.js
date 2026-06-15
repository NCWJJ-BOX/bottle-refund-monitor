import { Redis } from '@upstash/redis'

let kv = null
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kv = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
} catch {
  // Redis not available
}

const TARGET_PREFIX = 'target:'
const HISTORY_PREFIX = 'history:'
const EMPTY = []

/**
 * Guard: return empty/fallback if Redis is unavailable.
 */
function guard() {
  if (!kv) return true
  return false
}

export async function listTargets(type = null) {
  if (guard()) return EMPTY

  const keys = []
  let cursor = '0'
  try {
    do {
      const result = await kv.scan(cursor, { match: `${TARGET_PREFIX}*`, count: 100 })
      cursor = result[0]
      keys.push(...result[1])
    } while (cursor !== '0')
  } catch {
    return EMPTY
  }

  const targets = []
  for (const key of keys) {
    try {
      const data = await kv.get(key)
      if (data && (!type || data.type === type)) targets.push(data)
    } catch { /* skip */ }
  }
  return targets
}

export async function getTarget(id) {
  if (guard()) return null
  const cleanId = sanitizeId(id)
  if (!cleanId) return null
  try {
    return await kv.get(`${TARGET_PREFIX}${cleanId}`)
  } catch {
    return null
  }
}

export async function setTarget(id, data) {
  if (guard()) return data
  const cleanId = sanitizeId(id)
  if (!cleanId) return data
  try {
    await kv.set(`${TARGET_PREFIX}${cleanId}`, data)
  } catch { /* ignore */ }
  return data
}

export async function deleteTarget(id) {
  if (guard()) return
  const cleanId = sanitizeId(id)
  if (!cleanId) return
  try {
    await kv.del(`${TARGET_PREFIX}${cleanId}`, `${HISTORY_PREFIX}${cleanId}`)
  } catch { /* ignore */ }
}

export async function getHistory(id, limit = 50) {
  if (guard()) return EMPTY
  const cleanId = sanitizeId(id)
  if (!cleanId) return EMPTY
  try {
    const history = (await kv.get(`${HISTORY_PREFIX}${cleanId}`)) || []
    return history.slice(0, Math.min(limit, 100))
  } catch {
    return EMPTY
  }
}

export async function appendHistory(id, entry) {
  if (guard()) return
  const cleanId = sanitizeId(id)
  if (!cleanId) return
  try {
    const historyKey = `${HISTORY_PREFIX}${cleanId}`
    const history = (await kv.get(historyKey)) || []
    history.unshift(entry)
    if (history.length > 500) history.length = 500
    await kv.set(historyKey, history)
  } catch { /* ignore */ }
}

export async function runHttpChecks() {
  const targets = await listTargets('http')
  const results = []

  for (const target of targets) {
    const start = Date.now()
    let status = 'offline'
    let statusCode = 0
    let error = null

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const resp = await fetch(target.url, {
        method: target.method || 'GET',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      statusCode = resp.status
      const expected = target.expected_status || 200
      if (statusCode === expected || (statusCode >= 200 && statusCode < 300)) {
        status = 'online'
      }
    } catch (e) {
      error = e.name === 'AbortError' ? 'Timeout (15s)' : e.message
    }

    const responseTime = Date.now() - start
    const updated = {
      ...target,
      status,
      status_code: statusCode,
      response_time_ms: responseTime,
      last_check: new Date().toISOString(),
      error,
    }
    delete updated._loading

    await setTarget(target.id, updated)

    await appendHistory(target.id, {
      status,
      status_code: statusCode,
      response_time_ms: responseTime,
      timestamp: new Date().toISOString(),
      error,
    })

    results.push({ id: target.id, name: target.name, status, responseTime, statusCode })
  }

  return results
}

export function sanitizeId(id) {
  if (!id || typeof id !== 'string') return ''
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
}
