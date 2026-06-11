import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

/**
 * Rate limiter using Upstash Redis (sliding window)
 * @param {string} key - Unique key (e.g., IP address or identifier)
 * @param {number} limit - Max requests allowed
 * @param {number} window - Time window in seconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export async function rateLimit(key, limit = 5, window = 60) {
  const now = Date.now()
  const windowStart = now - window * 1000
  const redisKey = `ratelimit:${key}`

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(redisKey, 0, windowStart)
  pipeline.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` })
  pipeline.zcard(redisKey)
  pipeline.expire(redisKey, window)

  const results = await pipeline.exec()
  const count = results[2]

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: now + window * 1000,
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
