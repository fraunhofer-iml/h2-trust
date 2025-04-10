import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UnitsService } from './units.service';

describe('UnitsService', () => {
  let service: UnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UnitsService, provideHttpClient()] });
    service = TestBed.inject(UnitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
