import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighSpendNonConvertingQueries } from './high-spend-non-converting-queries';

describe('HighSpendNonConvertingQueries', () => {
  let component: HighSpendNonConvertingQueries;
  let fixture: ComponentFixture<HighSpendNonConvertingQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighSpendNonConvertingQueries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighSpendNonConvertingQueries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
