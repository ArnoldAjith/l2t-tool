import { ComponentFixture, TestBed } from '@angular/core/testing';

import { L2tDeviation } from './l2t-deviation';

describe('L2tDeviation', () => {
  let component: L2tDeviation;
  let fixture: ComponentFixture<L2tDeviation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L2tDeviation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(L2tDeviation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
