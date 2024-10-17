import { TransactionDto } from '../dto/transaction.dto';
import { ValidationStrategy } from '../../domain/strategies/validation.strategy';
import { MaxValueValidationStrategy } from '../../domain/strategies/max-value.strategy';
import { ValidationStatus } from '../../domain/enums/validation-status.enum';
import { Logger } from '@nestjs/common';

export class TransactionValidationUseCase {
  private validationStrategy: ValidationStrategy[];
  private logger = new Logger('TransactionValidationUseCase');

  constructor() {
    this.validationStrategy = [new MaxValueValidationStrategy()];
  }

  validateTransaction(transaction: TransactionDto): ValidationStatus {
    this.logger.log(`Validating transaction ${JSON.stringify(transaction)}`);
    for (const strategy of this.validationStrategy) {
      const result = strategy.validate(transaction);
      if (result === ValidationStatus.REJECTED) {
        return ValidationStatus.REJECTED;
      }
    }
    return ValidationStatus.APPROVED;
  }
}
