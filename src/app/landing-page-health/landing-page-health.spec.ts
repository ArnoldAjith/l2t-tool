import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageHealth } from './landing-page-health';

describe('LandingPageHealth', () => {
  let component: LandingPageHealth;
  let fixture: ComponentFixture<LandingPageHealth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageHealth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageHealth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
