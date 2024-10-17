import { Injectable, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { UpdateTransactionUseCase } from '../../application/uses-cases/update-transaction/update-transaction.usecase';

@Injectable()
export class KafkaConsumerService {
  private logger = new Logger('KafkaConsumerService');
  private kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });
  private consumer = this.kafka.consumer({
    groupId: 'transaction-update-group',
  });

  constructor(
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
  ) {}

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'transaction_status_updated',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        this.logger.log('Received message from Kafka');
        const transactionData = JSON.parse(message.value.toString());

        try {
          const result =
            await this.updateTransactionUseCase.execute(transactionData);

          if (result) {
            this.logger.log(
              `Transaction ${transactionData.id} updated successfully`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error updating transaction status: ${error.message}`,
          );
        }
      },
    });
  }
}
