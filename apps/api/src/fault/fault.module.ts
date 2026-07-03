import { Module, Global } from '@nestjs/common';
import { RateLimitService } from './fault.service';

@Global()
@Module({
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class FaultModule {}
