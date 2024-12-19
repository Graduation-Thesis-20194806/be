import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  constructor() {}

  private getOctokit(accessToken: string): Octokit {
    return new Octokit({ auth: accessToken });
  }

  async getUserProjects(username: string, accessToken: string) {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.projects.listForUser({
      username,
      per_page: 10,
    });
    return data;
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    accessToken: string,
  ) {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
    });
    return data;
  }
}
