import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisapprovedAdsOrExtensions } from './disapproved-ads-or-extensions';

describe('DisapprovedAdsOrExtensions', () => {
  let component: DisapprovedAdsOrExtensions;
  let fixture: ComponentFixture<DisapprovedAdsOrExtensions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisapprovedAdsOrExtensions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisapprovedAdsOrExtensions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
