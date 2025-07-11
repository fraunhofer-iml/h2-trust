import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UsersService } from '../users/users.service';
import { BottlingService } from './bottling.service';

describe('ProcessService', () => {
  let service: BottlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BottlingService, UsersService, provideHttpClient()] });
    service = TestBed.inject(BottlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
