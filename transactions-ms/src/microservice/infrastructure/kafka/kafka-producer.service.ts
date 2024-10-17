import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { CreateTransactionDto } from '../../application/dto/transaction.dto';

@Injectable()
export class KafkaProducerService {
  private logger = new Logger('KafkaProducerService');
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'transaction-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.producer = this.kafka.producer();
    this.producer.connect();
  }

  async sendTransactionCreated(transaction: CreateTransactionDto) {
    this.logger.log('Sending transaction to Kafka');
    await this.producer.send({
      topic: 'transaction_created',
      messages: [
        {
          value: JSON.stringify(transaction),
        },
      ],
    });
  }
}
