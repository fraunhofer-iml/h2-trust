import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { BottlingOverviewComponent } from './bottling-overview.component';

describe('BottlingOverviewComponent', () => {
  let component: BottlingOverviewComponent;
  let fixture: ComponentFixture<BottlingOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottlingOverviewComponent],
      providers: [
        AuthService,
        BottlingService,
        UsersService,
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(),
        provideAnimations(),
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
          },
        },
        provideQueryClient(new QueryClient()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottlingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
