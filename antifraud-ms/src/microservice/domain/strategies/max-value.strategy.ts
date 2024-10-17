import { TransactionDto } from '../../application/dto/transaction.dto';
import { ValidationStrategy } from './validation.strategy';

export class MaxValueValidationStrategy implements ValidationStrategy {
  validate(transaction: TransactionDto): 'approved' | 'rejected' {
    if (transaction.value > 1000) {
      return 'rejected';
    }
    return 'approved';
  }
}
