import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './auth/user.entity';
import { Mock } from './mocks/mock.entity';
import { RequestLog } from './logs/log.entity';
import { AuthModule } from './auth/auth.module';
import { MocksModule } from './mocks/mocks.module';
import { FaultModule } from './fault/fault.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Mock, RequestLog],
        synchronize: true, // Auto-create tables in dev
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    MocksModule,
    FaultModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
