import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionUseCase } from '../../microservice/application/uses-cases/update-transaction/update-transaction.usecase';
import { TransactionRepository } from '../../microservice/domain/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../microservice/domain/repositories/transaction.repository';
import { UpdateTransactionDto } from '../../microservice/application/dto/transaction.dto';
import { TransactionStatus } from '../../microservice/domain/enums/transaction.enums';

describe('UpdateTransactionUseCase', () => {
  let useCase: UpdateTransactionUseCase;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let transactionRepository: TransactionRepository;

  const mockTransactionRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionUseCase>(UpdateTransactionUseCase);
    transactionRepository = module.get<TransactionRepository>(
      TRANSACTION_REPOSITORY,
    );
  });

  describe('execute', () => {
    it('should successfully update a transaction status', async () => {
      const updateTransactionDto: UpdateTransactionDto = {
        id: 'generated-uuid',
        accountExternalIdCredit: '550e8400-e29b-41d4-a716-446655440000',
        accountExternalIdDebit: '550e8400-e29b-41d4-a716-446655440001',
        tranferTypeId: 1,
        value: 100,
        status: TransactionStatus.APPROVED,
      };

      mockTransactionRepository.findById.mockResolvedValue({
        id: updateTransactionDto.id,
      });
      mockTransactionRepository.updateStatus.mockResolvedValue(undefined);

      const result = await useCase.execute(updateTransactionDto);

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        updateTransactionDto.id,
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        updateTransactionDto.id,
        updateTransactionDto.status,
      );
      expect(result).toBe(true);
    });

    it('should throw an error if transaction not found', async () => {
      const updateTransactionDto: UpdateTransactionDto = {
        id: 'generated-uuid',
        accountExternalIdCredit: '550e8400-e29b-41d4-a716-446655440000',
        accountExternalIdDebit: '550e8400-e29b-41d4-a716-446655440001',
        tranferTypeId: 1,
        value: 100,
        status: TransactionStatus.APPROVED,
      };

      mockTransactionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(updateTransactionDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(
        updateTransactionDto.id,
      );
    });
  });
});
