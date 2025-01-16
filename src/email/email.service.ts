import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

@Injectable()
export class EmailService {
  private sesClient: SESClient;

  constructor(private configService: ConfigService) {
    if (
      this.configService.get<string>('AWS_ACCESS_KEY_ID') &&
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY')
    ) {
      this.sesClient = new SESClient({
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>(
            'AWS_SECRET_ACCESS_KEY',
          ),
        },
      });
    } else {
      this.sesClient = new SESClient({
        region: this.configService.get<string>('AWS_REGION'),
      });
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ) {
    // Load the Markdown template
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      `${templateName}.md`,
    );
    let markdownContent = fs.readFileSync(templatePath, 'utf8');

    // Replace variables in the Markdown template
    markdownContent = this.replaceTemplateVariables(
      markdownContent,
      templateData,
    );

    // Convert Markdown to HTML
    const htmlContent = await marked(markdownContent);

    // Prepare email parameters
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Data: htmlContent,
          },
          Text: {
            Data: markdownContent,
          },
        },
        Subject: {
          Data: subject,
        },
      },
      Source: this.configService.get<string>('EMAIL_FROM'),
    };

    // Send the email
    try {
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      console.log('Email sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private replaceTemplateVariables(
    template: string,
    data: Record<string, any>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
  }
}
