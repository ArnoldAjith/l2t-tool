import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayOfWeekOptimization } from './day-of-week-optimization';

describe('DayOfWeekOptimization', () => {
  let component: DayOfWeekOptimization;
  let fixture: ComponentFixture<DayOfWeekOptimization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayOfWeekOptimization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayOfWeekOptimization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
