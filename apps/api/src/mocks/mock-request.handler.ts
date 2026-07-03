import { Controller, All, Req, Res, Param, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { MocksService } from './mocks.service';
import { SchemaFakerService } from '../faker/schema-faker.service';
import { RateLimitService } from '../fault/fault.service';
import { LogsService } from '../logs/logs.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { match } from 'path-to-regexp';

@Controller('mock')
export class MockRequestHandler {
  private redis: Redis;

  constructor(
    private mocksService: MocksService,
    private fakerService: SchemaFakerService,
    private faultService: RateLimitService,
    private logsService: LogsService,
    private configService: ConfigService,
  ) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL')!);
  }

  @All(':mockId/*')
  async handleMockTraffic(@Param('mockId') mockId: string, @Req() req: Request, @Res() res: Response) {
    const startTime = Date.now();

    // 1. Load mock config
    const mock = await this.mocksService.getMockConfig(mockId);
    if (!mock) {
      throw new NotFoundException('Mock server not found');
    }

    // Safely extract the path after /mock/:mockId
    const requestPath = req.path.replace(`/mock/${mockId}`, '') || '/';
    const method = req.method.toUpperCase();

    // 2. Match route
    let matchedRoute: any = null;
    let pathParams = {};

    for (const route of mock.config.routes) {
      if (route.method.toUpperCase() !== method) continue;

      // Use path-to-regexp to match dynamic segments like /orders/:id
      const matcher = match(route.path, { decode: decodeURIComponent });
      const matchResult = matcher(requestPath);

      if (matchResult) {
        matchedRoute = route;
        pathParams = matchResult.params;
        break;
      }
    }

    if (!matchedRoute) {
      throw new NotFoundException(`Route ${method} ${requestPath} not found in mock config`);
    }

    // 3. Auth Check (Simulated)
    if (matchedRoute.protected) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${mock.mock_token}`) {
        throw new UnauthorizedException('Unauthorized. Include Bearer token.');
      }
    }

    // 4. Fault Injection (Latency, Errors, Rate Limits)
    if (matchedRoute.rate_limit_per_minute) {
      await this.faultService.checkRateLimit(mockId, method, requestPath, matchedRoute.rate_limit_per_minute);
    }
    
    try {
      this.faultService.applyErrorRate(matchedRoute.error_rate || 0);
    } catch (error: any) {
      await this.logsService.writeLog(mockId, method, requestPath, 500, Date.now() - startTime, req.body, { error: error.message });
      throw error;
    }

    await this.faultService.applyLatency(matchedRoute.latency_base_ms || 0, matchedRoute.latency_jitter_ms || 0);

    // 5. Stateful CRUD & Data Generation
    const resourceName = matchedRoute.path.split('/')[1] || 'resource';
    const resourceId = pathParams['id'] || null;

    let responseData;
    let statusCode = 200;

    if (method === 'POST') {
      responseData = this.fakerService.generateData(matchedRoute.response, resourceName);
      const generatedId = responseData.id || responseData[`${resourceName}_id`] || 'new_id';
      await this.redis.set(`mock:${mockId}:${resourceName}:${generatedId}`, JSON.stringify(responseData));
      // Expire state after 7 days automatically
      await this.redis.expire(`mock:${mockId}:${resourceName}:${generatedId}`, 604800);
      statusCode = 201;
    } 
    else if (method === 'GET') {
      if (resourceId) {
        // Try to get specific resource
        const cached = await this.redis.get(`mock:${mockId}:${resourceName}:${resourceId}`);
        if (cached) {
          responseData = JSON.parse(cached);
        } else {
          responseData = this.fakerService.generateData(matchedRoute.response, resourceName);
        }
      } else {
        // Collection GET
        const keys = await this.redis.keys(`mock:${mockId}:${resourceName}:*`);
        if (keys.length > 0) {
          responseData = [];
          for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) responseData.push(JSON.parse(data));
          }
        } else {
          responseData = this.fakerService.generateData(matchedRoute.response, resourceName);
        }
      }
    }
    else if (method === 'DELETE' && resourceId) {
      await this.redis.del(`mock:${mockId}:${resourceName}:${resourceId}`);
      statusCode = 204;
      responseData = null;
    } else {
      // Fallback for PUT/PATCH etc.
      responseData = this.fakerService.generateData(matchedRoute.response, resourceName);
    }

    await this.logsService.writeLog(mockId, method, requestPath, statusCode, Date.now() - startTime, req.body, responseData);
    
    if (statusCode === 204) {
      return res.status(204).send();
    }
    return res.status(statusCode).json(responseData);
  }
}
