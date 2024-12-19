import { DynamicModule, Module } from '@nestjs/common';
import { GithubService } from './github.service';

@Module({
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {
  static forRoot(option: { isGlobal?: boolean } = {}): DynamicModule {
    return {
      global: option.isGlobal,
      module: GithubModule,
    };
  }
}
