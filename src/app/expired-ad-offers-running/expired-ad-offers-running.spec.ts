import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredAdOffersRunning } from './expired-ad-offers-running';

describe('ExpiredAdOffersRunning', () => {
  let component: ExpiredAdOffersRunning;
  let fixture: ComponentFixture<ExpiredAdOffersRunning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredAdOffersRunning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredAdOffersRunning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
