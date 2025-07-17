import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { ProductPassComponent } from './product-pass.component';

describe('ProductPassComponent', () => {
  let component: ProductPassComponent;
  let fixture: ComponentFixture<ProductPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPassComponent],
      providers: [
        provideQueryClient(new QueryClient()),
        provideHttpClient(),
        BottlingService,
        provideAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
