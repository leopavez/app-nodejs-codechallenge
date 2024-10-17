import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountExternalIdDebit: string;

  @Column()
  accountExternalIdCredit: string;

  @Column()
  tranferTypeId: number;

  @Column('decimal')
  value: number;

  @Column()
  status: string;

  @Column()
  createdAt: Date;
}
