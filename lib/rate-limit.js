import { Redis } from '@upstash/redis'

let redis = null
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
} catch {
  // Redis not available — rate limiting disabled
}

/**
 * Rate limiter using Upstash Redis (sliding window)
 * Falls back to no limit if Redis is not configured.
 */
export async function rateLimit(key, limit = 5, window = 60) {
  if (!redis) {
    return { allowed: true, remaining: limit, resetAt: Date.now() + window * 1000 }
  }

  const now = Date.now()
  const windowStart = now - window * 1000
  const redisKey = `ratelimit:${key}`

  try {
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
  } catch {
    return { allowed: true, remaining: limit, resetAt: now + window * 1000 }
  }
}

export function getClientIp(request) {
  // Vercel sets x-real-ip to the actual client IP (trusted header)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  // Fallback: x-forwarded-for can be spoofed but better than nothing
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
