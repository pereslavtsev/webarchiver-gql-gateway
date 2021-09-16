import { Test, TestingModule } from '@nestjs/testing';
import { WebArchiveService } from './web-archive.service';

describe('WebArchiveService', () => {
  let service: WebArchiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebArchiveService],
    }).compile();

    service = module.get<WebArchiveService>(WebArchiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
