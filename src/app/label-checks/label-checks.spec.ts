import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelChecks } from './label-checks';

describe('LabelChecks', () => {
  let component: LabelChecks;
  let fixture: ComponentFixture<LabelChecks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelChecks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelChecks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
