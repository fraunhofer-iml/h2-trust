import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HydrogenStorageTableComponent } from './hydrogen-storage-table.component';

describe('HydrogenStorageTableComponent', () => {
  let component: HydrogenStorageTableComponent;
  let fixture: ComponentFixture<HydrogenStorageTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HydrogenStorageTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HydrogenStorageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
