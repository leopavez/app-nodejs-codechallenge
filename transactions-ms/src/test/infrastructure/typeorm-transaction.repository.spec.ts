import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepositoryOrm } from '../../microservice/infrastructure/adapters/typeorm-transaction.repository';
import { TransactionOrmEntity } from '../../microservice/infrastructure/persistence/transaction-orm.entity';
import { Repository } from 'typeorm';
import { Transaction } from '../../microservice/domain/entities/transaction.entity';
import { TransactionStatus } from '../../microservice/domain/enums/transaction.enums';
import { NotFoundException } from '@nestjs/common';

describe('TransactionRepositoryOrm', () => {
  let repository: TransactionRepositoryOrm;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ormRepository: Repository<TransactionOrmEntity>;

  const mockOrmRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepositoryOrm,
        {
          provide: 'TransactionOrmEntityRepository',
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TransactionRepositoryOrm>(TransactionRepositoryOrm);
    ormRepository = module.get<Repository<TransactionOrmEntity>>(
      'TransactionOrmEntityRepository',
    );
  });

  describe('save', () => {
    it('should save a transaction', async () => {
      const transaction: Transaction = {
        id: 'generated-uuid',
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        approve: function (): void {
          throw new Error('Function not implemented.');
        },
        reject: function (): void {
          throw new Error('Function not implemented.');
        },
      };

      mockOrmRepository.save.mockResolvedValue(transaction);

      const result = await repository.save(transaction);

      expect(mockOrmRepository.save).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        id: transaction.id,
        accountExternalIdDebit: transaction.accountExternalIdDebit,
        accountExternalIdCredit: transaction.accountExternalIdCredit,
        tranferTypeId: transaction.tranferTypeId,
        value: transaction.value,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    });

    it('should throw an error when saving fails', async () => {
      const transaction: Transaction = {
        id: 'generated-uuid',
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
        status: TransactionStatus.APPROVED,
        createdAt: new Date(),
        approve: function (): void {
          throw new Error('Function not implemented.');
        },
        reject: function (): void {
          throw new Error('Function not implemented.');
        },
      };

      mockOrmRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(repository.save(transaction)).rejects.toThrow(
        'Error saving transaction: Database error',
      );
    });
  });

  describe('findById', () => {
    it('should return a transaction by ID', async () => {
      const transactionEntity: TransactionOrmEntity = {
        id: 'generated-uuid',
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
        status: TransactionStatus.APPROVED,
        createdAt: new Date(),
      };

      mockOrmRepository.findOne.mockResolvedValue(transactionEntity);

      const result = await repository.findById(transactionEntity.id);

      expect(mockOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: transactionEntity.id },
      });
      expect(result).toEqual(
        expect.objectContaining({ id: transactionEntity.id }),
      );
    });

    it('should return null if transaction not found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('invalid-uuid');

      expect(mockOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invalid-uuid' },
      });
      expect(result).toBeNull();
    });

    it('should throw NotFoundException on error', async () => {
      mockOrmRepository.findOne.mockRejectedValue(new Error('Some error'));

      await expect(repository.findById('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the transaction status', async () => {
      const transactionId = 'generated-uuid';
      const status = TransactionStatus.APPROVED;

      await repository.updateStatus(transactionId, status);

      expect(mockOrmRepository.update).toHaveBeenCalledWith(
        { id: transactionId },
        { status },
      );
    });

    it('should throw an error when updating status fails', async () => {
      const transactionId = 'generated-uuid';
      const status = TransactionStatus.APPROVED;

      mockOrmRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.updateStatus(transactionId, status),
      ).rejects.toThrow('Error updating transaction status: Database error');
    });
  });
});
