import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroActiveAdGroup } from './zero-active-ad-group';

describe('ZeroActiveAdGroup', () => {
  let component: ZeroActiveAdGroup;
  let fixture: ComponentFixture<ZeroActiveAdGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZeroActiveAdGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZeroActiveAdGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
