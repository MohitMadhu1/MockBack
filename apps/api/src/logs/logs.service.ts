import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from './log.entity';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Subject } from 'rxjs';

@Injectable()
export class LogsService {
  private redisPub: Redis;
  private redisSub: Redis;
  
  // Local event emitter for SSE
  private logEvents = new Subject<any>();

  constructor(
    @InjectRepository(RequestLog)
    private logsRepository: Repository<RequestLog>,
    private configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL')!;
    this.redisPub = new Redis(redisUrl);
    this.redisSub = new Redis(redisUrl);

    // Subscribe to all log events across all instances
    this.redisSub.psubscribe('logs:*');
    this.redisSub.on('pmessage', (pattern, channel, message) => {
      this.logEvents.next({ channel, data: JSON.parse(message) });
    });
  }

  async writeLog(mockId: string, method: string, path: string, statusCode: number, latencyMs: number, reqBody: any, resBody: any) {
    // 1. Save to DB
    const log = this.logsRepository.create({
      mock_id: mockId,
      method,
      path,
      status_code: statusCode,
      latency_ms: latencyMs,
      request_body: reqBody,
      response_body: resBody,
    });
    await this.logsRepository.save(log);

    // 2. Publish to Redis for real-time SSE
    await this.redisPub.publish(`logs:${mockId}`, JSON.stringify(log));
  }

  async getLogs(mockId: string, limit = 50) {
    return this.logsRepository.find({
      where: { mock_id: mockId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  getLogStream() {
    return this.logEvents.asObservable();
  }
}
