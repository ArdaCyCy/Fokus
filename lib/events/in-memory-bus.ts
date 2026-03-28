/**
 * Geliştirme / tek instance için basit olay otobüsü.
 * Üretimde Kafka/SQS/Rabbit yerine kullanılmaz; arayüz benzeri kod yolu sağlar.
 */
type Handler = (payload: unknown) => void;

const handlers = new Map<string, Set<Handler>>();

export function subscribeEvent(topic: string, fn: Handler): () => void {
  if (!handlers.has(topic)) handlers.set(topic, new Set());
  handlers.get(topic)!.add(fn);
  return () => handlers.get(topic)?.delete(fn);
}

export function publishEvent(topic: string, payload: unknown): void {
  handlers.get(topic)?.forEach((fn) => {
    try {
      fn(payload);
    } catch {
      /* no-op */
    }
  });
}
