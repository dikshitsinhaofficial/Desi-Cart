type RateLimiterOptions = {
  windowMs: number;
  max: number;
};

const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, options: RateLimiterOptions) {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || record.resetTime < now) {
    store.set(ip, { count: 1, resetTime: now + options.windowMs });
    return { success: true, remaining: options.max - 1 };
  }

  if (record.count >= options.max) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  store.set(ip, record);
  return { success: true, remaining: options.max - record.count };
}
