import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseSheetComponent } from './sheet.component';

describe('SheetComponent', () => {
  let component: BaseSheetComponent;
  let fixture: ComponentFixture<BaseSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
