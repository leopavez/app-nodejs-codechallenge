import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository';
import { CreateTransactionDto } from '../../dto/transaction.dto';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionResponseDto } from '../../dto/transaction.dto';
import { KafkaProducerService } from '../../../infrastructure/kafka/kafka-producer.service';

@Injectable()
export class CreateTransactionUseCase {
  private logger = new Logger('CreateTransactionUseCase');
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private transactionRepository: TransactionRepository,
    private kafkaProducerService: KafkaProducerService,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    try {
      this.logger.log('Creating transaction with DTO: ' + JSON.stringify(dto));
      const transaction = new Transaction(
        uuid(),
        dto.accountExternalIdDebit,
        dto.accountExternalIdCredit,
        dto.tranferTypeId,
        dto.value,
      );

      const savedTransaction =
        await this.transactionRepository.save(transaction);

      await this.kafkaProducerService.sendTransactionCreated(savedTransaction);

      return {
        transactionExternalId: transaction.id,
        transactionType: { name: 'transfer' },
        transactionStatus: { name: transaction.status },
        value: transaction.value,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      this.logger.error('Error creating transaction: ' + error.message);
      throw new InternalServerErrorException(
        'Error creating transaction',
        error.message,
      );
    }
  }
}
