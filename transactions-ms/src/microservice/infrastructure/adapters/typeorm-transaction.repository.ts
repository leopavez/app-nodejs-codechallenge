import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { TransactionOrmEntity } from '../persistence/transaction-orm.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction.enums';

@Injectable()
export class TransactionRepositoryOrm implements TransactionRepository {
  private logger = new Logger('TransactionRepositoryOrm');
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    try {
      this.logger.log('Saving transaction: ' + JSON.stringify(transaction));
      const transactionEntity = this.toOrmEntity(transaction);
      const savedEntity = await this.repository.save(transactionEntity);
      return this.toDomain(savedEntity);
    } catch (error) {
      this.logger.error('Error saving transaction: ' + error.message);
      throw new Error(`Error saving transaction: ${error.message}`);
    }
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    try {
      this.logger.log('Getting transaction by ID: ' + transactionId);
      const entity = await this.repository.findOne({
        where: { id: transactionId },
      });
      if (!entity) {
        return null;
      }
      return this.toDomain(entity);
    } catch (error) {
      this.logger.error('Error getting transaction: ' + error.message);
      throw new NotFoundException(`Transaction not found: ${error.message}`);
    }
  }

  async updateStatus(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<void> {
    try {
      this.logger.log(
        `Updating transaction status: ${transactionId} with status: ${status}`,
      );
      await this.repository.update({ id: transactionId }, { status });
    } catch (error) {
      this.logger.error('Error updating transaction status: ' + error.message);
      throw new Error(`Error updating transaction status: ${error.message}`);
    }
  }

  private toOrmEntity(transaction: Transaction): TransactionOrmEntity {
    return {
      id: transaction.id,
      accountExternalIdDebit: transaction.accountExternalIdDebit,
      accountExternalIdCredit: transaction.accountExternalIdCredit,
      tranferTypeId: transaction.tranferTypeId,
      value: transaction.value,
      status: transaction.status,
      createdAt: transaction.createdAt,
    };
  }

  private toDomain(entity: TransactionOrmEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.accountExternalIdDebit,
      entity.accountExternalIdCredit,
      entity.tranferTypeId,
      entity.value,
      entity.status as TransactionStatus,
      entity.createdAt,
    );
  }
}
