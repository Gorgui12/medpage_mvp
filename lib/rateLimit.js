// lib/rateLimit.js

/**
 * Rate limiter en mémoire (sliding window par fenêtre fixe).
 * Suffisant pour un MVP mono-instance ; sur Vercel serverless, le compteur
 * est réinitialisé à chaque cold start (mitigation de base seulement).
 *
 * Pour une vraie protection en prod : Upstash Redis (@upstash/rate-limiter)
 * ou un WAF en amont.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const buckets = new Map(); // clé -> { count, resetAt }

function pruneExpired(now) {
  // Nettoyage opportuniste pour éviter une croissance illimitée de la Map
  if (buckets.size < 1000) return;
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}

/**
 * Retourne { ok: true } si la clé est sous le quota, sinon
 * { ok: false, retryAfter } (secondes à attendre avant de retenter).
 */
export function rateLimit(key, max = 5, windowMs = WINDOW_MS) {
  const now = Date.now();
  pruneExpired(now);

  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  entry.count += 1;

  if (entry.count > max) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  return { ok: true };
}

/**
 * Extrait l'IP cliente depuis les headers (Vercel / proxys standards).
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
