import { IsUUID, IsInt, IsPositive, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  accountExternalIdDebit: string;

  @IsUUID()
  accountExternalIdCredit: string;

  @IsInt()
  tranferTypeId: number;

  @IsPositive()
  value: number;
}

export class TransactionResponseDto {
  transactionExternalId: string;
  transactionType: { name: string };
  transactionStatus: { name: string };
  value: number;
  createdAt: Date;
}

export class UpdateTransactionDto extends CreateTransactionDto {
  @IsUUID()
  id: string;

  @IsString()
  status: string;
}
