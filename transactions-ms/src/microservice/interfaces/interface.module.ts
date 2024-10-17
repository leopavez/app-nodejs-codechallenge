import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [TransactionController],
})
export class InterfaceModule {}
