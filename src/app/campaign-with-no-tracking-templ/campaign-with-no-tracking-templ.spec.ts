import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignWithNoTrackingTempl } from './campaign-with-no-tracking-templ';

describe('CampaignWithNoTrackingTempl', () => {
  let component: CampaignWithNoTrackingTempl;
  let fixture: ComponentFixture<CampaignWithNoTrackingTempl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignWithNoTrackingTempl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignWithNoTrackingTempl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
