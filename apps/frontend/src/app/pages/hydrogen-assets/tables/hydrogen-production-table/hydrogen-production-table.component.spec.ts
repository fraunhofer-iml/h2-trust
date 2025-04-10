import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UsersService } from '../../../../shared/services/users/users.service';
import { HydrogenProductionTableComponent } from './hydrogen-production-table.component';

describe('HydrogenProductionTableComponent', () => {
  let component: HydrogenProductionTableComponent;
  let fixture: ComponentFixture<HydrogenProductionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HydrogenProductionTableComponent],
      providers: [
        provideHttpClient(),
        AuthService,
        UnitsService,
        UsersService,
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HydrogenProductionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
