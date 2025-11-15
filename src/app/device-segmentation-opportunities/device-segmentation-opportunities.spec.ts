import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSegmentationOpportunities } from './device-segmentation-opportunities';

describe('DeviceSegmentationOpportunities', () => {
  let component: DeviceSegmentationOpportunities;
  let fixture: ComponentFixture<DeviceSegmentationOpportunities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceSegmentationOpportunities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceSegmentationOpportunities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
