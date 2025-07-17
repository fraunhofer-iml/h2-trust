import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { StorageFillingLevelsComponent } from './storage-filling-levels.component';

describe('StorageFillingLevelsComponent', () => {
  let component: StorageFillingLevelsComponent;
  let fixture: ComponentFixture<StorageFillingLevelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageFillingLevelsComponent],
      providers: [UnitsService],
    }).compileComponents();

    fixture = TestBed.createComponent(StorageFillingLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
