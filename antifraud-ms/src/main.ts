import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { KafkaService } from './microservice/infrastructure/kafka/kafka.service';

async function bootstrap() {
  const logger = new Logger('main');

  const app = await NestFactory.create(AppModule);

  const KafkaServiceInstance = new KafkaService();
  KafkaServiceInstance.run();

  await app.listen(3001).then(() => {
    logger.log('Antifraud service is running on port 3001');
  });
}
bootstrap();
