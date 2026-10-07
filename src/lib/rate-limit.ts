// Fixed-window in-memory limiter. Fine for a single app container;
// swap for Redis if you scale horizontally.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  entry.count++;
  return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.reset - now) / 1000) };
}

/** nginx overwrites X-Real-IP with the true peer address, so it can't be spoofed by clients. */
export function clientIp(headers: Headers) {
  return headers.get("x-real-ip") ?? "unknown";
}
