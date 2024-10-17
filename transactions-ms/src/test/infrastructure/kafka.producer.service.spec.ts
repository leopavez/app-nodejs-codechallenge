/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerService } from '../../microservice/infrastructure/kafka/kafka-producer.service';
import { Kafka, Producer } from 'kafkajs';
import { CreateTransactionDto } from '../../microservice/application/dto/transaction.dto';

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;
  let producer: Producer;

  const mockProducer = {
    connect: jest.fn().mockResolvedValue(undefined),
    send: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    jest
      .spyOn(Kafka.prototype, 'producer')
      .mockReturnValue(mockProducer as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [KafkaProducerService],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
  });

  describe('sendTransactionCreated', () => {
    it('should send transaction to Kafka', async () => {
      const transaction: CreateTransactionDto = {
        accountExternalIdDebit: 'debit-account',
        accountExternalIdCredit: 'credit-account',
        tranferTypeId: 1,
        value: 100,
      };

      await service.sendTransactionCreated(transaction);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'transaction_created',
        messages: [
          {
            value: JSON.stringify(transaction),
          },
        ],
      });
    });
  });
});
