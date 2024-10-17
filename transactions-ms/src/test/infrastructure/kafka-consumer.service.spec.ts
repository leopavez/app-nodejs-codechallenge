/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaConsumerService } from '../../microservice/infrastructure/kafka/kafka-consumer.service';
import { UpdateTransactionUseCase } from '../../microservice/application/uses-cases/update-transaction/update-transaction.usecase';
import { Kafka } from 'kafkajs';

describe('KafkaConsumerService', () => {
  let service: KafkaConsumerService;
  let updateTransactionUseCase: UpdateTransactionUseCase;

  const mockUpdateTransactionUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaConsumerService,
        {
          provide: UpdateTransactionUseCase,
          useValue: mockUpdateTransactionUseCase,
        },
      ],
    }).compile();

    service = module.get<KafkaConsumerService>(KafkaConsumerService);
    updateTransactionUseCase = module.get<UpdateTransactionUseCase>(
      UpdateTransactionUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should consume messages and update transaction', async () => {
      const mockMessage = {
        value: JSON.stringify({ id: 'generated-uuid', status: 'PENDING' }),
      };
      const mockConnect = jest
        .spyOn(service['consumer'], 'connect')
        .mockResolvedValue(undefined);
      const mockSubscribe = jest
        .spyOn(service['consumer'], 'subscribe')
        .mockResolvedValue(undefined);
      const mockRun = jest
        .spyOn(service['consumer'], 'run')
        .mockImplementation(({ eachMessage }) => {
          eachMessage({
            topic: 'transaction_status_updated',
            partition: 0,
            message: {
              value: Buffer.from(
                JSON.stringify({ id: 'generated-uuid', status: 'PENDING' }),
              ),
              key: null,
              timestamp: Date.now().toString(),
              attributes: 0,
              offset: '0',
              headers: {},
            },
            heartbeat: async () => {},
            pause: () => () => {},
          });
          return Promise.resolve();
        });

      mockUpdateTransactionUseCase.execute.mockResolvedValue(true);

      await service.run();

      expect(mockConnect).toHaveBeenCalled();
      expect(mockSubscribe).toHaveBeenCalledWith({
        topic: 'transaction_status_updated',
        fromBeginning: false,
      });
      expect(mockRun).toHaveBeenCalled();

      expect(mockUpdateTransactionUseCase.execute).toHaveBeenCalledWith({
        id: 'generated-uuid',
        status: 'PENDING',
      });
    });

    it('should log an error if update fails', async () => {
      const mockMessage = {
        value: JSON.stringify({ id: 'generated-uuid', status: 'PENDING' }),
      };

      const mockConnect = jest
        .spyOn(service['consumer'], 'connect')
        .mockResolvedValue(undefined);
      const mockSubscribe = jest
        .spyOn(service['consumer'], 'subscribe')
        .mockResolvedValue(undefined);
      const mockRun = jest
        .spyOn(service['consumer'], 'run')
        .mockImplementation(({ eachMessage }) => {
          eachMessage({
            topic: 'transaction_status_updated',
            partition: 0,
            message: {
              value: Buffer.from(
                JSON.stringify({ id: 'generated-uuid', status: 'PENDING' }),
              ),
              key: null,
              timestamp: Date.now().toString(),
              attributes: 0,
              offset: '0',
              headers: {},
            },
            heartbeat: async () => {},
            pause: () => () => {},
          });
          return Promise.resolve();
        });
      mockUpdateTransactionUseCase.execute.mockRejectedValue(
        new Error('Transaction not found'),
      );

      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await service.run();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error updating transaction status: Transaction not found`,
      );
    });
  });
});
