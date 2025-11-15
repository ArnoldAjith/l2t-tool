import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertWhenActiveCampaignBudget } from './alert-when-active-campaign-budget';

describe('AlertWhenActiveCampaignBudget', () => {
  let component: AlertWhenActiveCampaignBudget;
  let fixture: ComponentFixture<AlertWhenActiveCampaignBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertWhenActiveCampaignBudget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertWhenActiveCampaignBudget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
