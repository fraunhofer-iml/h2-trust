import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UsersService } from '../users/users.service';
import { ProductionService } from './production.service';

describe('ProductionService', () => {
  let service: ProductionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProductionService, UsersService, provideHttpClient()] });
    service = TestBed.inject(ProductionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
