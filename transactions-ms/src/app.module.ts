import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterfaceModule } from './microservice/interfaces/interface.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'transactions',
      autoLoadEntities: true,
      synchronize: true,
    }),
    InterfaceModule,
  ],
})
export class AppModule {}
