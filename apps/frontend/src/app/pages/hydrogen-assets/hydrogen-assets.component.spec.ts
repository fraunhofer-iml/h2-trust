import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HydrogenAssetsComponent } from './hydrogen-assets.component';

describe('HydrogenAssetsComponent', () => {
  let component: HydrogenAssetsComponent;
  let fixture: ComponentFixture<HydrogenAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HydrogenAssetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HydrogenAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
