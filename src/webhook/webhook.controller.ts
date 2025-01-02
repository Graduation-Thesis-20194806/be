import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { GithubService } from '../github/github.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Public } from 'src/auth/decorator/public-guard.decorator';
import { Status, TaskStatusCategory } from '@prisma/client';

@Public()
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly githubService: GithubService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Handle GitHub Webhooks.
   * Endpoint: POST /webhook/github
   */
  @Post('github')
  async handleGithubWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-hub-signature-256') signature256: string,
  ) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret || !signature256) {
      this.logger.warn('Missing webhook secret or signature.');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const rawBody = req.body as Buffer;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const digest = `sha256=${hmac.digest('hex')}`;

    if (!signature256 || !this.verifySignature(digest, signature256)) {
      throw new HttpException('Invalid signature.', HttpStatus.UNAUTHORIZED);
    }

    const event = req.headers['x-github-event'] as string;
    const payload = JSON.parse(rawBody.toString('utf8'));

    this.logger.log(`Received GitHub event: ${event}`);

    try {
      switch (event) {
        case 'issues':
          await this.handleIssueEvent(payload);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event}`);
      }

      res.status(200).send('Webhook processed');
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      res.status(500).send('Internal Server Error');
    }
  }

  private verifySignature(digest: string, signatureHeader: string): boolean {
    const signatureBuffer = Buffer.from(signatureHeader);
    const digestBuffer = Buffer.from(digest);
    if (signatureBuffer.length !== digestBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
  }
  private async handleIssueEvent(payload: any) {
    const action = payload.action;
    const issue = payload.issue;
    this.logger.log(
      `Handling issues event, action: ${action}, issue: ${issue.html_url}`,
    );
    const repository = payload.repository;
    const task = await this.prismaService.task.findFirst({
      where: {
        IssueGithub: {
          repo: {
            githubId: repository.id.toString(),
          },
          number: issue.number,
        },
      },
    });
    if (!task) return;
    let status_data: Status;
    const data = {} as any;
    switch (action) {
      case 'reopened':
        status_data = await this.prismaService.status.findFirst({
          where: {
            projectId: task.projectId,
            category: TaskStatusCategory.REOPEN,
          },
        });
        data.statusId = status_data.id;
        break;
      case 'closed':
        status_data = await this.prismaService.status.findFirst({
          where: {
            projectId: task.projectId,
            category: TaskStatusCategory.CLOSE,
          },
        });
        data.statusId = status_data.id;
        break;
      case 'deleted':
        await this.prismaService.issueGithub.delete({
          where: {
            taskId: task.id,
            number: issue.number,
          },
        });
        break;
      case 'edited':
        data.name = issue.title;
        data.description = issue.body;
        break;
      default:
        return;
    }
    await this.prismaService.task.update({
      where: { id: task.id },
      data,
    });
  }
}
