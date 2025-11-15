import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoTargetingConsistency } from './geo-targeting-consistency';

describe('GeoTargetingConsistency', () => {
  let component: GeoTargetingConsistency;
  let fixture: ComponentFixture<GeoTargetingConsistency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoTargetingConsistency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoTargetingConsistency);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
