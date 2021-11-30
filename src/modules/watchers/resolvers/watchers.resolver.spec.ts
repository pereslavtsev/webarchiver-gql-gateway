import { Test, TestingModule } from '@nestjs/testing';
import { WatchersResolver } from './watchers.resolver';

describe('WatchersResolver', () => {
  let resolver: WatchersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchersResolver],
    }).compile();

    resolver = module.get<WatchersResolver>(WatchersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
