import { Redis } from '@upstash/redis'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const TARGET_PREFIX = 'target:'
const HISTORY_PREFIX = 'history:'

/**
 * List all targets, optionally filtered by type.
 */
export async function listTargets(type = null) {
  const keys = []
  let cursor = '0'
  do {
    const result = await kv.scan(cursor, { match: `${TARGET_PREFIX}*`, count: 100 })
    cursor = result[0]
    keys.push(...result[1])
  } while (cursor !== '0')

  const targets = []
  for (const key of keys) {
    const data = await kv.get(key)
    if (data && (!type || data.type === type)) {
      targets.push(data)
    }
  }
  return targets
}

export async function getTarget(id) {
  const cleanId = sanitizeId(id)
  return await kv.get(`${TARGET_PREFIX}${cleanId}`)
}

export async function setTarget(id, data) {
  const cleanId = sanitizeId(id)
  await kv.set(`${TARGET_PREFIX}${cleanId}`, data)
  return data
}

export async function deleteTarget(id) {
  const cleanId = sanitizeId(id)
  await kv.del(`${TARGET_PREFIX}${cleanId}`, `${HISTORY_PREFIX}${cleanId}`)
}

/**
 * Get history for a target.
 */
export async function getHistory(id, limit = 50) {
  const cleanId = sanitizeId(id)
  const history = (await kv.get(`${HISTORY_PREFIX}${cleanId}`)) || []
  return history.slice(0, Math.min(limit, 100))
}

/**
 * Append an entry to target history.
 */
export async function appendHistory(id, entry) {
  const cleanId = sanitizeId(id)
  const historyKey = `${HISTORY_PREFIX}${cleanId}`
  const history = (await kv.get(historyKey)) || []
  history.unshift(entry)
  if (history.length > 500) history.length = 500
  await kv.set(historyKey, history)
}

/**
 * Run active HTTP checks on all http-type targets.
 */
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

    const historyEntry = {
      status,
      status_code: statusCode,
      response_time_ms: responseTime,
      timestamp: new Date().toISOString(),
      error,
    }
    await appendHistory(target.id, historyEntry)

    results.push({ id: target.id, name: target.name, status, responseTime, statusCode })
  }

  return results
}

export function sanitizeId(id) {
  if (!id || typeof id !== 'string') return ''
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
}
