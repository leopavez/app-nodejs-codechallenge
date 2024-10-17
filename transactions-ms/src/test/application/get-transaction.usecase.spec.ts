import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionByIdUseCase } from '../../microservice/application/uses-cases/get-transaction-by-id/get-transaction-by-id.usecase';
import { TransactionRepository } from '../../microservice/domain/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../microservice/domain/repositories/transaction.repository';
import { Transaction } from '../../microservice/domain/entities/transaction.entity';

describe('GetTransactionByIdUseCase', () => {
  let useCase: GetTransactionByIdUseCase;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let transactionRepository: TransactionRepository;

  const mockTransactionRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionByIdUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionByIdUseCase>(GetTransactionByIdUseCase);
    transactionRepository = module.get<TransactionRepository>(
      TRANSACTION_REPOSITORY,
    );
  });

  describe('execute', () => {
    it('should successfully get a transaction by ID', async () => {
      const transactionId = 'generated-uuid';
      const transaction = new Transaction(
        transactionId,
        'accountDebit',
        'accountCredit',
        1,
        100,
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);

      const result = await useCase.execute(transactionId);

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        transactionId,
      );
      expect(result).toEqual(
        expect.objectContaining({
          transactionExternalId: transaction.id,
          transactionType: { name: 'transfer' },
          transactionStatus: { name: transaction.status },
          value: transaction.value,
          createdAt: expect.any(Date),
        }),
      );
    });

    it('should throw an error if transaction not found', async () => {
      const transactionId = 'invalid-uuid';
      mockTransactionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(transactionId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        transactionId,
      );
    });
  });
});
