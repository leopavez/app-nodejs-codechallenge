import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionOrmEntity } from './persistence/transaction-orm.entity';
import { TransactionRepositoryOrm } from './adapters/typeorm-transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity])],
  providers: [TransactionRepositoryOrm],
  exports: [TransactionRepositoryOrm],
})
export class InfrastructureModule {}
