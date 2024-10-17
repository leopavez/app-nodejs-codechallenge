import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository';
import { TransactionResponseDto } from '../../dto/transaction.dto';

@Injectable()
export class GetTransactionByIdUseCase {
  private logger = new Logger('GetTransactionByIdUseCase');
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string): Promise<TransactionResponseDto> {
    try {
      this.logger.log('Getting transaction by ID: ' + id);
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      return {
        transactionExternalId: transaction.id,
        transactionType: { name: 'transfer' },
        transactionStatus: { name: transaction.status },
        value: transaction.value,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      this.logger.error('Error getting transaction: ' + error.message);
      throw new InternalServerErrorException(
        'Error getting transaction',
        error.message,
      );
    }
  }
}
