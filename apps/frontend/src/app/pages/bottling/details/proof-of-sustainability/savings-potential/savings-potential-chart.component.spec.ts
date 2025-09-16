import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavingsPotentialChartComponent } from './savings-potential-chart.component';

describe('SavingsPotentialChartComponent', () => {
  let component: SavingsPotentialChartComponent;
  let fixture: ComponentFixture<SavingsPotentialChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingsPotentialChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsPotentialChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
