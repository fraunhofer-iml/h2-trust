import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchCardComponent } from '../batch-card.component';

describe('BatchCardComponent', () => {
  let component: BatchCardComponent;
  let fixture: ComponentFixture<BatchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('batch', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
