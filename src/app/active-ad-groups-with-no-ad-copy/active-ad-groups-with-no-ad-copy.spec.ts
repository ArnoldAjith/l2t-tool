import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveAdGroupsWithNoAdCopy } from './active-ad-groups-with-no-ad-copy';

describe('ActiveAdGroupsWithNoAdCopy', () => {
  let component: ActiveAdGroupsWithNoAdCopy;
  let fixture: ComponentFixture<ActiveAdGroupsWithNoAdCopy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveAdGroupsWithNoAdCopy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveAdGroupsWithNoAdCopy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
