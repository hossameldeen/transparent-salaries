import { TestBed, inject } from '@angular/core/testing';

import { WorkerMessageService } from './worker-message.service';

describe('WorkerMessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkerMessageService]
    });
  });

  it('should be created', inject([WorkerMessageService], (service: WorkerMessageService) => {
    expect(service).toBeTruthy();
  }));
});
