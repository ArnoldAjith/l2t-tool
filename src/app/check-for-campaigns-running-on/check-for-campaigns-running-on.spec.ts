import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckForCampaignsRunningOn } from './check-for-campaigns-running-on';

describe('CheckForCampaignsRunningOn', () => {
  let component: CheckForCampaignsRunningOn;
  let fixture: ComponentFixture<CheckForCampaignsRunningOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckForCampaignsRunningOn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckForCampaignsRunningOn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
