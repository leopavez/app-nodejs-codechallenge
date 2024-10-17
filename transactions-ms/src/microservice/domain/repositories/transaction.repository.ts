import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction.enums';

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(transactionId: string): Promise<Transaction | null>;
  updateStatus(transactionId: string, status: TransactionStatus): Promise<void>;
}
