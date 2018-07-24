import { TestBed, inject } from '@angular/core/testing';

import { SharedWorkerService } from './shared-worker.service';

describe('SharedWorkerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedWorkerService]
    });
  });

  it('should be created', inject([SharedWorkerService], (service: SharedWorkerService) => {
    expect(service).toBeTruthy();
  }));
});
