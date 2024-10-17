import { TransactionDto } from '../../application/dto/transaction.dto';

export abstract class ValidationStrategy {
  abstract validate(transaction: TransactionDto): 'approved' | 'rejected';
}
