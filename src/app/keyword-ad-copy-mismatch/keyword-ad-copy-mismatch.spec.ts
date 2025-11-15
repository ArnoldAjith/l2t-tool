import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordAdCopyMismatch } from './keyword-ad-copy-mismatch';

describe('KeywordAdCopyMismatch', () => {
  let component: KeywordAdCopyMismatch;
  let fixture: ComponentFixture<KeywordAdCopyMismatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeywordAdCopyMismatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeywordAdCopyMismatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
