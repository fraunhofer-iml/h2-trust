import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HydrogenProductionTableComponent } from './hydrogen-production-table.component';

describe('HydrogenProductionTableComponent', () => {
  let component: HydrogenProductionTableComponent;
  let fixture: ComponentFixture<HydrogenProductionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HydrogenProductionTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HydrogenProductionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
