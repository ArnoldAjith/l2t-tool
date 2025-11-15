import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveAdGroupsWithNoKeywords } from './active-ad-groups-with-no-keywords';

describe('ActiveAdGroupsWithNoKeywords', () => {
  let component: ActiveAdGroupsWithNoKeywords;
  let fixture: ComponentFixture<ActiveAdGroupsWithNoKeywords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveAdGroupsWithNoKeywords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveAdGroupsWithNoKeywords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
