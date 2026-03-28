import { NextResponse } from "next/server";

type CachedResponse = {
  createdAt: number;
  fingerprint: string;
  body: unknown;
  status: number;
};

const TTL_MS = 10 * 60 * 1000;

const globalCache = globalThis as unknown as {
  idempotencyCache?: Map<string, CachedResponse>;
};

function getCache(): Map<string, CachedResponse> {
  if (!globalCache.idempotencyCache) {
    globalCache.idempotencyCache = new Map<string, CachedResponse>();
  }
  return globalCache.idempotencyCache;
}

function purgeExpired(cache: Map<string, CachedResponse>, now: number): void {
  for (const [k, v] of cache.entries()) {
    if (now - v.createdAt > TTL_MS) cache.delete(k);
  }
}

export function getIdempotencyReplay(params: {
  namespace: string;
  userId: string;
  key: string;
  fingerprint: string;
  requestId: string;
}): NextResponse | null {
  const cache = getCache();
  const now = Date.now();
  purgeExpired(cache, now);
  const cacheKey = `${params.namespace}:${params.userId}:${params.key}`;
  const hit = cache.get(cacheKey);
  if (!hit) return null;
  if (hit.fingerprint !== params.fingerprint) {
    return NextResponse.json(
      { error: "Ayni Idempotency-Key farkli bir istek govdesi ile kullanildi." },
      { status: 409, headers: { "X-Request-Id": params.requestId } }
    );
  }
  const replay = NextResponse.json(hit.body, { status: hit.status });
  replay.headers.set("Idempotency-Replayed", "true");
  replay.headers.set("X-Request-Id", params.requestId);
  replay.headers.set("Cache-Control", "no-store");
  return replay;
}

export function saveIdempotencyResult(params: {
  namespace: string;
  userId: string;
  key: string;
  fingerprint: string;
  body: unknown;
  status: number;
}): void {
  const cache = getCache();
  const cacheKey = `${params.namespace}:${params.userId}:${params.key}`;
  cache.set(cacheKey, {
    createdAt: Date.now(),
    fingerprint: params.fingerprint,
    body: params.body,
    status: params.status,
  });
}
