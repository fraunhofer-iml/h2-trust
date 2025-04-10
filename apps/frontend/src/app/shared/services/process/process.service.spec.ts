import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UsersService } from '../users/users.service';
import { ProcessService } from './process.service';

describe('ProcessService', () => {
  let service: ProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProcessService, UsersService, provideHttpClient()] });
    service = TestBed.inject(ProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
