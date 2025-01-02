import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  constructor(private readonly configService: ConfigService) {}

  private getOctokit(accessToken: string): Octokit {
    return new Octokit({ auth: accessToken });
  }

  async getUserRepos(username: string, accessToken: string, page: number = 1) {
    const octokit = new Octokit({
      auth: accessToken,
    });
    const { data } = await octokit.rest.repos.listForUser({
      username,
      per_page: 10,
      page,
    });
    return data;
  }

  async getOrgRepos(org: string, accessToken: string, page: number = 1) {
    const octokit = new Octokit({
      auth: accessToken,
    });
    const { data } = await octokit.rest.repos.listForOrg({
      org,
      per_page: 10,
      page,
    });
    return data;
  }

  async listUserOrganizations(
    username: string,
    accessToken: string,
    page: number = 1,
  ) {
    const octokit = new Octokit({
      auth: accessToken,
    });
    const response = await octokit.request('/user/orgs', {
      username,
      per_page: 10,
      page,
    });

    return response.data;
  }

  async createIssue(
    accessToken: string,
    owner: string,
    repo: string,
    createData: { title: string; body: string; assignee?: string },
  ) {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.issues.create({
      owner,
      repo,
      ...createData,
      state: 'open',
    });
    return data;
  }

  async updateIssue(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number,
    updateData: {
      title?: string;
      body?: string;
      assignee?: string;
      state?: 'open' | 'closed';
    },
  ) {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      ...updateData,
    });
    return data;
  }

  async addWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    events: string[],
  ) {
    const octokit = new Octokit({ auth: accessToken });
    const config = {
      url: `${this.configService.get<string>('SERVER_URL')}/webhook/github`,
      content_type: 'json',
      secret: this.configService.get<string>('GITHUB_WEBHOOK_SECRET'),
    };
    const { data } = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config,
      events,
      active: true,
    });
    return data;
  }

  async removeWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    hookId: number,
  ) {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: hookId,
    });
    return data;
  }
}
