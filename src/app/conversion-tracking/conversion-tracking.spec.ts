import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionTracking } from './conversion-tracking';

describe('ConversionTracking', () => {
  let component: ConversionTracking;
  let fixture: ComponentFixture<ConversionTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversionTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
