import { KeycloakService } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthService,
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
            keycloakEvents$: of('test'),
          },
        },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
