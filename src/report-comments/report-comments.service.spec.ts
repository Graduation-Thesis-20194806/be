import { Test, TestingModule } from '@nestjs/testing';
import { ReportCommentsService } from './report-comments.service';

describe('ReportCommentsService', () => {
  let service: ReportCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportCommentsService],
    }).compile();

    service = module.get<ReportCommentsService>(ReportCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
