import { TransactionStatus } from '../enums/transaction.enums';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly accountExternalIdDebit: string,
    public readonly accountExternalIdCredit: string,
    public readonly tranferTypeId: number,
    public readonly value: number,
    public status: TransactionStatus = TransactionStatus.PENDING,
    public readonly createdAt: Date = new Date(),
  ) {}

  approve() {
    this.status = TransactionStatus.APPROVED;
  }

  reject() {
    this.status = TransactionStatus.REJECTED;
  }
}
