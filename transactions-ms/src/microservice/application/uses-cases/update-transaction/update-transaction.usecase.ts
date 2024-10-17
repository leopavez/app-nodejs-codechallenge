import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository';
import { UpdateTransactionDto } from '../../dto/transaction.dto';
import { TransactionStatus } from '../../../domain/enums/transaction.enums';

@Injectable()
export class UpdateTransactionUseCase {
  private logger = new Logger('UpdateTransactionUseCase');
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private transactionRepository: TransactionRepository,
  ) {}

  async execute(dto: UpdateTransactionDto): Promise<boolean> {
    try {
      this.logger.log(`Updating transaction with id: ${dto.id}`);

      const transactionFound = await this.transactionRepository.findById(
        dto.id,
      );

      if (!transactionFound) {
        throw new Error('Transaction not found');
      }

      await this.transactionRepository.updateStatus(
        dto.id,
        dto.status as TransactionStatus,
      );

      return true;
    } catch (error) {
      this.logger.error('Error getting transaction: ' + error.message);
      throw new InternalServerErrorException(
        'Error getting transaction',
        error.message,
      );
    }
  }
}
