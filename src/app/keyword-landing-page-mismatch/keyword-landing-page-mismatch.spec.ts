import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordLandingPageMismatch } from './keyword-landing-page-mismatch';

describe('KeywordLandingPageMismatch', () => {
  let component: KeywordLandingPageMismatch;
  let fixture: ComponentFixture<KeywordLandingPageMismatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeywordLandingPageMismatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeywordLandingPageMismatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
