import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoSegmentationOpportunities } from './geo-segmentation-opportunities';

describe('GeoSegmentationOpportunities', () => {
  let component: GeoSegmentationOpportunities;
  let fixture: ComponentFixture<GeoSegmentationOpportunities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoSegmentationOpportunities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoSegmentationOpportunities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
