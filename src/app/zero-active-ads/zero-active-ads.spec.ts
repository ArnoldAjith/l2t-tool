import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroActiveAds } from './zero-active-ads';

describe('ZeroActiveAds', () => {
  let component: ZeroActiveAds;
  let fixture: ComponentFixture<ZeroActiveAds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZeroActiveAds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZeroActiveAds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
