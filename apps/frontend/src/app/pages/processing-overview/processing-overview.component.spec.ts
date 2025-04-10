import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersService } from '../../shared/services/users/users.service';
import { ProcessingOverviewComponent } from './processing-overview.component';

describe('ProcessingOverviewComponent', () => {
  let component: ProcessingOverviewComponent;
  let fixture: ComponentFixture<ProcessingOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessingOverviewComponent],
      providers: [
        UsersService,
        provideHttpClient(),
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
