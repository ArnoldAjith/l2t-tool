import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetAllocationEfficiency } from './budget-allocation-efficiency';

describe('BudgetAllocationEfficiency', () => {
  let component: BudgetAllocationEfficiency;
  let fixture: ComponentFixture<BudgetAllocationEfficiency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetAllocationEfficiency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetAllocationEfficiency);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
