import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { AddProductionDataComponent } from './add-production-data.component';

describe('AddProductionDataComponent', () => {
  let component: AddProductionDataComponent;
  let fixture: ComponentFixture<AddProductionDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductionDataComponent],
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

    fixture = TestBed.createComponent(AddProductionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
