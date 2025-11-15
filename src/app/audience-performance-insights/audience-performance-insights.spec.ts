import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiencePerformanceInsights } from './audience-performance-insights';

describe('AudiencePerformanceInsights', () => {
  let component: AudiencePerformanceInsights;
  let fixture: ComponentFixture<AudiencePerformanceInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiencePerformanceInsights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiencePerformanceInsights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
