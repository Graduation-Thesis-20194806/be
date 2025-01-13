// src/sqs/sqs.consumer.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SqsService } from './sqs.service';

@Injectable()
export class SqsConsumer {
  private readonly logger = new Logger(SqsConsumer.name);

  constructor(private readonly sqsService: SqsService) {}

  // Poll every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async pollMessages() {
    try {
      const queueUrl =
        'https://sqs.ap-southeast-1.amazonaws.com/680828732035/ThesisQueue.fifo';
      const messages = await this.sqsService.receiveMessages(queueUrl, 10);
      for (const msg of messages) {
        this.logger.log(`Processing message: ${msg.Body}`);

        await this.sqsService.handleRedisMessage(JSON.parse(msg.Body));
        // Acknowledge (delete) the message
        await this.sqsService.deleteMessage(queueUrl, msg.ReceiptHandle);
      }
    } catch (error) {
      this.logger.error('Error polling messages:', error);
    }
  }
}
