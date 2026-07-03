import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('generate-schema')
  async generateSchema(@Body() body: any) {
    const llmUrl = this.configService.get<string>('LLM_SERVICE_URL');
    
    try {
      const res = await fetch(`${llmUrl}/generate-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new HttpException(data.detail || 'LLM Service failed', res.status);
      }
      return data;
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
