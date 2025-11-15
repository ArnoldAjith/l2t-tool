import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighRoasSearchTermsMissingInKeywordSet } from './high-roas-search-terms-missing-in-keyword-set';

describe('HighRoasSearchTermsMissingInKeywordSet', () => {
  let component: HighRoasSearchTermsMissingInKeywordSet;
  let fixture: ComponentFixture<HighRoasSearchTermsMissingInKeywordSet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighRoasSearchTermsMissingInKeywordSet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighRoasSearchTermsMissingInKeywordSet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
