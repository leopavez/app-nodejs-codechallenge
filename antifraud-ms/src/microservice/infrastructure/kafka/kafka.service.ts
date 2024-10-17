import { Kafka } from 'kafkajs';
import { TransactionValidationUseCase } from '../../application/uses-cases/transaction-validation.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { ValidationStatus } from '../../domain/enums/validation-status.enum';
import { Logger } from '@nestjs/common';

export class KafkaService {
  private kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });
  private consumer = this.kafka.consumer({
    groupId: 'transaction--validation-group',
  });
  private transactionService = new TransactionValidationUseCase();
  private logger = new Logger('KafkaService');

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'transaction_created',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        this.logger.log('Received message from Kafka');
        const transactionData = JSON.parse(message.value.toString());
        const validationResult =
          await this.transactionService.validateTransaction(transactionData);

        await this.emitTransactionStatus(
          transactionData,
          validationResult as ValidationStatus,
        );
      },
    });
  }

  async emitTransactionStatus(
    transaction: Transaction,
    status: ValidationStatus,
  ) {
    this.logger.log(`Emitting transaction status to Kafka: ${status}`);

    const producer = this.kafka.producer();
    await producer.connect();

    await producer.send({
      topic: 'transaction_status_updated',
      messages: [
        {
          value: JSON.stringify({
            ...transaction,
            status,
          }),
        },
      ],
    });
  }
}
