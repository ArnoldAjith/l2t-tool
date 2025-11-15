import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredSitesLink } from './expired-sites-link';

describe('ExpiredSitesLink', () => {
  let component: ExpiredSitesLink;
  let fixture: ComponentFixture<ExpiredSitesLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredSitesLink]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredSitesLink);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
