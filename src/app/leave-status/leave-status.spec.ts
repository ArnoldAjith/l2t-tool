import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveStatus } from './leave-status';

describe('LeaveStatus', () => {
  let component: LeaveStatus;
  let fixture: ComponentFixture<LeaveStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
