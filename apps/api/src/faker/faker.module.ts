import { Module, Global } from '@nestjs/common';
import { SchemaFakerService } from './schema-faker.service';

@Global()
@Module({
  providers: [SchemaFakerService],
  exports: [SchemaFakerService],
})
export class FakerModule {}
