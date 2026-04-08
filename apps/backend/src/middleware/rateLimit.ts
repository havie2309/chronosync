import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  name: string;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitRecord>();

function getClientKey(req: Request, name: string) {
  const userKey = req.user?.id ?? req.user?.email;
  const fallbackKey = req.ip ?? "unknown";

  return `${name}:${userKey ?? fallbackKey}`;
}

function createRateLimit({ windowMs, maxRequests, name }: RateLimitOptions) {
  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    const key = getClientKey(req, name);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      });

      next();
      return;
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);

      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: "Too many requests. Please try again shortly.",
        retryAfterSeconds
      });
      return;
    }

    current.count += 1;
    buckets.set(key, current);
    next();
  };
}

export { createRateLimit };
