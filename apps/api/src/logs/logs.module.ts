import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
