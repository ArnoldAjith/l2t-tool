import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateKeywordsDetection } from './duplicate-keywords-detection';

describe('DuplicateKeywordsDetection', () => {
  let component: DuplicateKeywordsDetection;
  let fixture: ComponentFixture<DuplicateKeywordsDetection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuplicateKeywordsDetection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplicateKeywordsDetection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
