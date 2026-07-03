import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL')!);
  }

  /**
   * Applies rate limiting via Redis Lua script (Token Bucket).
   * Throws 429 HttpException if limit exceeded.
   */
  async checkRateLimit(mockId: string, method: string, path: string, limitPerMinute: number) {
    const key = `ratelimit:${mockId}:${method}:${path}`;
    const windowSeconds = 60;

    const luaScript = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local current = tonumber(redis.call('GET', key) or 0)
      if current >= limit then return 0 end
      redis.call('INCR', key)
      redis.call('EXPIRE', key, window)
      return 1
    `;

    const result = await this.redis.eval(luaScript, 1, key, limitPerMinute.toString(), windowSeconds.toString());

    if (result === 0) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  applyLatency(baseMs: number, jitterMs: number): Promise<void> {
    const delay = baseMs + Math.random() * jitterMs;
    if (delay <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  applyErrorRate(errorRate: number) {
    if (errorRate > 0 && Math.random() < errorRate) {
      throw new HttpException('Internal Server Error (Simulated)', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
