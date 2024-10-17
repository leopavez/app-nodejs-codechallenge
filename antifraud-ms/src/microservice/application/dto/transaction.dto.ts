import { IsUUID, IsInt, IsPositive } from 'class-validator';

export class TransactionDto {
  @IsUUID()
  id: string;

  @IsUUID()
  accountExternalIdDebit: string;

  @IsUUID()
  accountExternalIdCredit: string;

  @IsInt()
  tranferTypeId: number;

  @IsPositive()
  value: number;
}
