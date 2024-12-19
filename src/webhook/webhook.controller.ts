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

    const rawBody = (req as any).rawBody;

    // Compute the signature
    const computedSignature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;

    // Compare signatures
    if (
      !crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(signature256),
      )
    ) {
      this.logger.warn('Invalid signature.');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const event = req.headers['x-github-event'] as string;
    const payload = req.body;

    this.logger.log(`Received GitHub event: ${event}`);

    try {
      switch (event) {
        case 'project':
          await this.handleProjectEvent(payload);
          break;
        case 'issues':
          await this.handleIssueEvent(payload);
          break;
        // Add more cases as needed
        default:
          this.logger.warn(`Unhandled event type: ${event}`);
      }

      res.status(200).send('Webhook processed');
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Handle project-related events.
   * @param payload The webhook payload.
   */
  private async handleProjectEvent(payload: any) {
    const action = payload.action;
    const project = payload.project;

    this.logger.log(
      `Handling project event: ${action} for project ID ${project.id}`,
    );

    if (action === 'created' || action === 'edited') {
      // Upsert Project
      await this.prismaService.project.upsert({
        where: { githubId: project.id },
        update: {
          githubId: project.id,
          githubName: project.name,
          githubURL: project.html_url,
        },
        create: {
          githubId: project.id,
          name: project.name,
          description: project.body || '',
          githubURL: project.html_url,
          githubName: project.name,
        },
      });

      this.logger.log(`Project ${project.name} has been ${action}d.`);
    }

    // Handle other actions like 'deleted' if needed
  }

  /**
   * Handle issue-related events.
   * @param payload The webhook payload.
   */
  private async handleIssueEvent(payload: any) {
    const action = payload.action;
    const issue = payload.issue;

    this.logger.log(`Handling issue event: ${action} for issue ID ${issue.id}`);

    if (action === 'opened' || action === 'edited') {
      this.logger.log(`Issue "${issue.title}" has been ${action}d.`);
    }

    // Handle other actions like 'closed' if needed
  }
}
