import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonalCampaignReadiness } from './seasonal-campaign-readiness';

describe('SeasonalCampaignReadiness', () => {
  let component: SeasonalCampaignReadiness;
  let fixture: ComponentFixture<SeasonalCampaignReadiness>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonalCampaignReadiness]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonalCampaignReadiness);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
