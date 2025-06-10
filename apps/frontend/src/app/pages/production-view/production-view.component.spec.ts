import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UsersService } from '../../shared/services/users/users.service';
import { ProductionViewComponent } from './production-view.component';

describe('ProductionViewComponent', () => {
  let component: ProductionViewComponent;
  let fixture: ComponentFixture<ProductionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionViewComponent],
      providers: [
        UsersService,
        AuthService,
        provideNoopAnimations(),
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

    fixture = TestBed.createComponent(ProductionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
