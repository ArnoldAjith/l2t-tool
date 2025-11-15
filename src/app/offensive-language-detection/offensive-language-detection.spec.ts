import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffensiveLanguageDetection } from './offensive-language-detection';

describe('OffensiveLanguageDetection', () => {
  let component: OffensiveLanguageDetection;
  let fixture: ComponentFixture<OffensiveLanguageDetection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffensiveLanguageDetection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffensiveLanguageDetection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
