import { Controller, Get, Param, Sse, UseGuards, MessageEvent } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@UseGuards(JwtAuthGuard)
@Controller('mocks/:mockId/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(@Param('mockId') mockId: string) {
    return this.logsService.getLogs(mockId);
  }

  @Sse('stream')
  streamLogs(@Param('mockId') mockId: string): Observable<MessageEvent> {
    console.log(`[SSE] Client connected to mock: ${mockId}`);
    return this.logsService.getLogStream().pipe(
      filter(event => event.channel === `logs:${mockId}`),
      map(event => {
        console.log(`[SSE] Emitting log for ${mockId}:`, event.data.method);
        return { data: event.data } as MessageEvent;
      }),
    );
  }
}
