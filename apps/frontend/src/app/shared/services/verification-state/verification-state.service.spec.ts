import { TestBed } from '@angular/core/testing';

import { VerificationStateService } from './verification-state.service';

describe('VerificationStateService', () => {
  let service: VerificationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerificationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
