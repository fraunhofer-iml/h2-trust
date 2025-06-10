import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { AddBottleComponent } from './add-bottle.component';

describe('AddBottleComponent', () => {
  let component: AddBottleComponent;
  let fixture: ComponentFixture<AddBottleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBottleComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        AuthService,
        UnitsService,
        UsersService,
        provideHttpClient(),
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
          },
        },
        provideQueryClient(new QueryClient()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBottleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
