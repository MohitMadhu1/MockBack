import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import Redis from 'ioredis';
import { Mock } from './mock.entity';

@Injectable()
export class MocksService {
  private redis: Redis;

  constructor(
    @InjectRepository(Mock)
    private mocksRepository: Repository<Mock>,
    private configService: ConfigService,
  ) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL')!);
  }

  async createMock(userId: string, name: string, config: any): Promise<Mock> {
    const mockId = nanoid(8);
    const mockToken = `mtkn_${nanoid(16)}`;

    const mock = this.mocksRepository.create({
      user_id: userId,
      mock_id: mockId,
      name,
      config,
      mock_token: mockToken,
    });

    await this.mocksRepository.save(mock);

    // Cache the config in Redis for fast routing later
    await this.redis.set(`mock:${mockId}:config`, JSON.stringify(mock));

    return mock;
  }

  async updateMock(userId: string, mockId: string, config: any): Promise<Mock> {
    const mock = await this.getMockById(userId, mockId);
    mock.config = config;
    await this.mocksRepository.save(mock);

    // Immediately update Redis so live server reflects changes
    await this.redis.set(`mock:${mockId}:config`, JSON.stringify(mock));
    return mock;
  }

  async getMocksByUser(userId: string): Promise<Mock[]> {
    return this.mocksRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getMockById(userId: string, mockId: string): Promise<Mock> {
    const mock = await this.mocksRepository.findOne({
      where: { user_id: userId, mock_id: mockId },
    });
    if (!mock) {
      throw new NotFoundException('Mock not found');
    }
    return mock;
  }

  async getMockConfig(mockId: string): Promise<Mock | null> {
    // 1. Try Redis first
    const cached = await this.redis.get(`mock:${mockId}:config`);
    if (cached) {
      return JSON.parse(cached);
    }
    // 2. Fallback to DB
    const mock = await this.mocksRepository.findOne({ where: { mock_id: mockId } });
    if (mock) {
      await this.redis.set(`mock:${mockId}:config`, JSON.stringify(mock));
      return mock;
    }
    return null;
  }

  async deleteMock(userId: string, mockId: string): Promise<void> {
    const mock = await this.getMockById(userId, mockId);
    await this.mocksRepository.remove(mock);

    // Clean up Redis: config and all stateful data for this mock
    const keys = await this.redis.keys(`mock:${mockId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    // Also clear rate limits
    const rlKeys = await this.redis.keys(`ratelimit:${mockId}:*`);
    if (rlKeys.length > 0) {
      await this.redis.del(...rlKeys);
    }
  }
}
