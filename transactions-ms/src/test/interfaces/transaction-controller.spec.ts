import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../microservice/interfaces/controllers/transaction.controller';
import { CreateTransactionUseCase } from '../../microservice/application/uses-cases/create-transaction/create-transaction.usecase';
import { GetTransactionByIdUseCase } from '../../microservice/application/uses-cases/get-transaction-by-id/get-transaction-by-id.usecase';
import {
  CreateTransactionDto,
  TransactionResponseDto,
} from '../../microservice/application/dto/transaction.dto';
import { HttpException } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let createTransactionUseCase: CreateTransactionUseCase;
  let getTransactionByIdUseCase: GetTransactionByIdUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetTransactionByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    createTransactionUseCase = module.get<CreateTransactionUseCase>(
      CreateTransactionUseCase,
    );
    getTransactionByIdUseCase = module.get<GetTransactionByIdUseCase>(
      GetTransactionByIdUseCase,
    );
  });

  describe('createTransaction', () => {
    it('should create a transaction and return a response', async () => {
      const transactionDto: CreateTransactionDto = {
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
      };

      const response: TransactionResponseDto = {
        ...transactionDto,
        transactionExternalId: '',
        transactionType: {
          name: '',
        },
        transactionStatus: {
          name: '',
        },
        createdAt: undefined,
      };

      jest
        .spyOn(createTransactionUseCase, 'execute')
        .mockResolvedValue(response);

      const result = await controller.createTransaction(transactionDto);

      expect(result).toEqual(response);
      expect(createTransactionUseCase.execute).toHaveBeenCalledWith(
        transactionDto,
      );
    });

    it('should throw an error if creating a transaction fails', async () => {
      const transactionDto: CreateTransactionDto = {
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
      };

      jest
        .spyOn(createTransactionUseCase, 'execute')
        .mockRejectedValue(new Error('Transaction error'));

      await expect(
        controller.createTransaction(transactionDto),
      ).rejects.toThrow(
        new Error('Error creating transaction: Transaction error'),
      );
    });

    it('should throw an HttpException if an unexpected error occurs', async () => {
      const transactionDto: CreateTransactionDto = {
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
      };

      jest
        .spyOn(createTransactionUseCase, 'execute')
        .mockRejectedValue(new HttpException('Unexpected error', 500));

      await expect(
        controller.createTransaction(transactionDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction by id', async () => {
      const transactionId = 'generated-uuid';
      const response: TransactionResponseDto = {
        transactionExternalId: '',
        transactionType: {
          name: '',
        },
        transactionStatus: {
          name: '',
        },
        value: 0,
        createdAt: undefined,
      };

      jest
        .spyOn(getTransactionByIdUseCase, 'execute')
        .mockResolvedValue(response);

      const result = await controller.getTransaction(transactionId);

      expect(result).toEqual(response);
      expect(getTransactionByIdUseCase.execute).toHaveBeenCalledWith(
        transactionId,
      );
    });

    it('should throw an error if getting a transaction fails', async () => {
      const transactionId = 'generated-uuid';

      jest
        .spyOn(getTransactionByIdUseCase, 'execute')
        .mockRejectedValue(new Error('Transaction not found'));

      await expect(controller.getTransaction(transactionId)).rejects.toThrow(
        new Error('Error getting transaction: Transaction not found'),
      );
    });

    it('should throw an HttpException if an unexpected error occurs', async () => {
      const transactionId = 'generated-uuid';

      jest
        .spyOn(getTransactionByIdUseCase, 'execute')
        .mockRejectedValue(new HttpException('Unexpected error', 500));

      await expect(controller.getTransaction(transactionId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
