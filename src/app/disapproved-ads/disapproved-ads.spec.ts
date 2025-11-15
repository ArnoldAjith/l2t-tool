import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisapprovedAds } from './disapproved-ads';

describe('DisapprovedAds', () => {
  let component: DisapprovedAds;
  let fixture: ComponentFixture<DisapprovedAds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisapprovedAds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisapprovedAds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
