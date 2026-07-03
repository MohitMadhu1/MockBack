import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MocksController } from './mocks.controller';
import { MocksService } from './mocks.service';
import { Mock } from './mock.entity';
import { MockRequestHandler } from './mock-request.handler';
import { FakerModule } from '../faker/faker.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mock]), FakerModule],
  controllers: [MocksController, MockRequestHandler],
  providers: [MocksService],
  exports: [MocksService],
})
export class MocksModule {}
