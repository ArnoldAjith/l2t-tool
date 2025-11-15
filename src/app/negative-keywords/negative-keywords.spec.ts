import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegativeKeywords } from './negative-keywords';

describe('NegativeKeywords', () => {
  let component: NegativeKeywords;
  let fixture: ComponentFixture<NegativeKeywords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegativeKeywords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NegativeKeywords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
