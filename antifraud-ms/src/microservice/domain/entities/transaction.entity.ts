export class Transaction {
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;

  constructor(
    accountExternalIdDebit: string,
    accountExternalIdCredit: string,
    transferTypeId: number,
    value: number,
  ) {
    this.accountExternalIdDebit = accountExternalIdDebit;
    this.accountExternalIdCredit = accountExternalIdCredit;
    this.transferTypeId = transferTypeId;
    this.value = value;
  }
}
