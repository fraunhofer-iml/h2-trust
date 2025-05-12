import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UsersService } from '../users/users.service';
import { ProcessingService } from './processing.service';

describe('ProcessService', () => {
  let service: ProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProcessingService, UsersService, provideHttpClient()] });
    service = TestBed.inject(ProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
