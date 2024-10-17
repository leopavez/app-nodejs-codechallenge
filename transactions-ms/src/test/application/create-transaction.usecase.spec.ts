/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '../../microservice/application/uses-cases/create-transaction/create-transaction.usecase';
import { TRANSACTION_REPOSITORY } from '../../microservice/domain/repositories/transaction.repository';
import { TransactionRepository } from '../../microservice/domain/repositories/transaction.repository';
import { KafkaProducerService } from '../../microservice/infrastructure/kafka/kafka-producer.service';
import { CreateTransactionDto } from '../../microservice/application/dto/transaction.dto';
import { Transaction } from '../../microservice/domain/entities/transaction.entity';
import { InternalServerErrorException } from '@nestjs/common';

const mockTransactionRepository = {
  save: jest.fn(),
};

const mockKafkaProducerService = {
  sendTransactionCreated: jest.fn(),
};

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let transactionRepository: TransactionRepository;
  let kafkaProducerService: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducerService,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    transactionRepository = module.get<TransactionRepository>(
      TRANSACTION_REPOSITORY,
    );
    kafkaProducerService =
      module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        accountExternalIdDebit: '550e8400-e29b-41d4-a716-446655440000',
        accountExternalIdCredit: '550e8400-e29b-41d4-a716-446655440001',
        tranferTypeId: 1,
        value: 100,
      };

      const transaction = new Transaction(
        'generated-id',
        createTransactionDto.accountExternalIdDebit,
        createTransactionDto.accountExternalIdCredit,
        createTransactionDto.tranferTypeId,
        createTransactionDto.value,
      );

      const savedTransaction = {
        ...transaction,
        status: 'pending',
        createdAt: new Date(),
      };

      mockTransactionRepository.save.mockResolvedValue(savedTransaction);
      mockKafkaProducerService.sendTransactionCreated.mockResolvedValue(true);

      const result = await useCase.execute(createTransactionDto);

      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          accountExternalIdCredit: createTransactionDto.accountExternalIdCredit,
          accountExternalIdDebit: createTransactionDto.accountExternalIdDebit,
          tranferTypeId: createTransactionDto.tranferTypeId,
          value: createTransactionDto.value,
        }),
      );

      expect(
        mockKafkaProducerService.sendTransactionCreated,
      ).toHaveBeenCalledWith(savedTransaction);

      expect(result).toEqual({
        transactionExternalId: expect.any(String),
        transactionType: { name: 'transfer' },
        transactionStatus: { name: 'pending' },
        value: transaction.value,
        createdAt: expect.any(Date),
      });
    });

    it('should throw an InternalServerErrorException when an error occurs', async () => {
      const createTransactionDto: CreateTransactionDto = {
        accountExternalIdDebit: 'accountDebit',
        accountExternalIdCredit: 'accountCredit',
        tranferTypeId: 1,
        value: 100,
      };

      mockTransactionRepository.save.mockRejectedValue(
        new Error('Database error occurred'),
      );

      await expect(useCase.execute(createTransactionDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockTransactionRepository.save).toHaveBeenCalled();
      expect(
        mockKafkaProducerService.sendTransactionCreated,
      ).not.toHaveBeenCalled();
    });
  });
});
