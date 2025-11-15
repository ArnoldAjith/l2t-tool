import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignBuild } from './campaign-build';

describe('CampaignBuild', () => {
  let component: CampaignBuild;
  let fixture: ComponentFixture<CampaignBuild>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignBuild]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignBuild);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
