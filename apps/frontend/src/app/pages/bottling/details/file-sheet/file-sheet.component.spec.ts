import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileSheetComponent } from './file-sheet.component';

describe('FileSheetComponent', () => {
  let component: FileSheetComponent;
  let fixture: ComponentFixture<FileSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
