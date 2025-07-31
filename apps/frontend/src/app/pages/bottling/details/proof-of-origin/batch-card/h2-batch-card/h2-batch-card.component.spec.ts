import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HydrogenBatchDto } from '@h2-trust/api';
import { H2BatchCardComponent } from './h2-batch-card.component';

describe('BatchCardComponent', () => {
  let component: H2BatchCardComponent;
  let fixture: ComponentFixture<H2BatchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [H2BatchCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(H2BatchCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('batch', {
      amount: 12,
      emission: { amount: 20 },
      accountingPeriodEnd: new Date(),
    } as HydrogenBatchDto);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
