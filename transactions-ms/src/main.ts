import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { KafkaConsumerService } from './microservice/infrastructure/kafka/kafka-consumer.service';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('main');
  const app = await NestFactory.create(AppModule);

  const KafkaServiceInstance = app.get(KafkaConsumerService);
  KafkaServiceInstance.run();

  await app.listen(3000).then(() => {
    logger.log('Transactions microservice is running');
  });
}
bootstrap();
