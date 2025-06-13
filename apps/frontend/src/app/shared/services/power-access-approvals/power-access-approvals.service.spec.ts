import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PowerAccessApprovalService } from './power-access-approvals.service';

describe('UnitsService', () => {
  let service: PowerAccessApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PowerAccessApprovalService, provideHttpClient()] });
    service = TestBed.inject(PowerAccessApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
