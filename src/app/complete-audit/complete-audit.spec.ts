import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteAudit } from './complete-audit';

describe('CompleteAudit', () => {
  let component: CompleteAudit;
  let fixture: ComponentFixture<CompleteAudit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteAudit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteAudit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
