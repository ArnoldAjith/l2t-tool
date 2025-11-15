import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveAutomation } from './incentive-automation';

describe('IncentiveAutomation', () => {
  let component: IncentiveAutomation;
  let fixture: ComponentFixture<IncentiveAutomation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveAutomation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveAutomation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
