import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateTransactionUseCase } from './uses-cases/create-transaction/create-transaction.usecase';
import { GetTransactionByIdUseCase } from './uses-cases/get-transaction-by-id/get-transaction-by-id.usecase';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository';
import { TransactionRepositoryOrm } from '../infrastructure/adapters/typeorm-transaction.repository';
import { TransactionOrmEntity } from '../infrastructure/persistence/transaction-orm.entity';
import { KafkaProducerService } from '../infrastructure/kafka/kafka-producer.service';
import { KafkaConsumerService } from '../infrastructure/kafka/kafka-consumer.service';
import { UpdateTransactionUseCase } from './uses-cases/update-transaction/update-transaction.usecase';

const usecases = [
  CreateTransactionUseCase,
  GetTransactionByIdUseCase,
  UpdateTransactionUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity])],
  providers: [
    ...usecases,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepositoryOrm,
    },
    KafkaProducerService,
    KafkaConsumerService,
  ],
  exports: [...usecases],
})
export class ApplicationModule {}
