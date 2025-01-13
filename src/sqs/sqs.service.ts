// src/sqs/sqs.service.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { messageType } from 'src/common/constant';
import {
  NotiAction,
  NotiEntity,
} from 'src/notifications/entities/notifications.entity';
import { DuplicateLevel } from '@prisma/client';
import { ReportsService } from 'src/reports/reports.service';
import { ProjectsService } from 'src/projects/projects.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;

  constructor(
    private reportsService: ReportsService,
    private projectsService: ProjectsService,
    private prismaService: PrismaService,
    private notificationsService: NotificationsService,
  ) {
    // Replace with your SQS region
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Send a message to the specified queue
   */
  async sendMessage(queueUrl: string, messageBody: string) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
      });

      const result = await this.sqsClient.send(command);
      this.logger.log(
        `Message sent successfully. MessageId: ${result.MessageId}`,
      );
      return result;
    } catch (err) {
      this.logger.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  }

  /**
   * Receive messages from the specified queue
   */
  async receiveMessages(queueUrl: string, maxNumberOfMessages = 1) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumberOfMessages,
        WaitTimeSeconds: 10, // Long polling
      });

      const response = await this.sqsClient.send(command);

      if (response.Messages && response.Messages.length > 0) {
        this.logger.log(`Received ${response.Messages.length} message(s).`);
        return response.Messages;
      }

      return [];
    } catch (err) {
      this.logger.error(`Failed to receive messages: ${err.message}`);
      throw err;
    }
  }

  /**
   * Delete a message from the specified queue
   */
  async deleteMessage(queueUrl: string, receiptHandle: string) {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
      this.logger.log(`Message deleted successfully.`);
    } catch (err) {
      this.logger.error(`Failed to delete message: ${err.message}`);
      throw err;
    }
  }

  async handleRedisMessage(data: Record<string, any>) {
    if (!data.type) return;
    if (data.type === messageType.BUG_REPORT) {
      const { reportId, issueType } = data;
      if (!reportId || !issueType) return;
      const report = await this.reportsService.getMeOne(reportId);
      if (!report) return;
      const assign = await this.projectsService.getAssignByIssueType(
        report.projectId,
        issueType,
      );
      await this.reportsService.updateReportInternal(reportId, {
        issueType,
        isProcessing: false,
        assignedTo: assign?.Assignee.userId,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: report.createdById },
        select: {
          username: true,
        },
      });
      await this.notificationsService.create(
        {
          userId: assign.Assignee.userId,
          projectId: report.projectId,
          content: {
            subject: {
              id: report.createdById,
              name: user.username,
            },
            action: NotiAction.CREAT,
            object: {
              id: report.id,
              name: report.name,
            },
            objectEntity: NotiEntity.REPORT,
          },
        },
        [assign.Assignee.userId],
      );
    }
    if (data.type === messageType.BUG_DUPLICATE) {
      const { reportId } = data;
      if (!reportId) return;
      const { dupReportIds } = data;
      if (dupReportIds?.length) {
        await this.prismaService.duplicateGroup.createMany({
          data: dupReportIds.map(
            (item: { id: number; level: DuplicateLevel }) => ({
              reportId1: Math.min(item.id, reportId),
              reportId2: Math.max(item.id, reportId),
              level: item.level,
            }),
          ),
        });
      }
    }
  }
}
