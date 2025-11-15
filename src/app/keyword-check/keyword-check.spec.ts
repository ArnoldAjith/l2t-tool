import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordCheck } from './keyword-check';

describe('KeywordCheck', () => {
  let component: KeywordCheck;
  let fixture: ComponentFixture<KeywordCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeywordCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeywordCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
