export type QueueBackend = "redis" | "memory";

const FALLBACK_WARNING =
  "Redis unavailable, using in-memory fallback. Do not use this in production.";

let cachedBackend: QueueBackend | null = null;
let detectPromise: Promise<QueueBackend> | null = null;
let warned = false;

export function warnInMemoryFallback(reason?: string) {
  if (warned) return;
  warned = true;
  const detail = reason ? ` (${reason})` : "";
  console.warn(`[LeadStack] ${FALLBACK_WARNING}${detail}`);
}

export async function resolveQueueBackend(): Promise<QueueBackend> {
  if (cachedBackend) return cachedBackend;
  if (!detectPromise) {
    detectPromise = detectQueueBackend();
  }
  cachedBackend = await detectPromise;
  return cachedBackend;
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

async function detectQueueBackend(): Promise<QueueBackend> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    warnInMemoryFallback("REDIS_URL not set");
    return "memory";
  }

  try {
    const { default: IORedis } = await import("ioredis");
    const client = new IORedis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    await client.connect();
    await client.ping();
    await client.quit();
    return "redis";
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : "connection failed";
    warnInMemoryFallback(reason);
    return "memory";
  }
}

/** Force memory mode (e.g. after a failed Redis enqueue). */
export function forceMemoryBackend() {
  cachedBackend = "memory";
  warnInMemoryFallback("switching after Redis error");
}
