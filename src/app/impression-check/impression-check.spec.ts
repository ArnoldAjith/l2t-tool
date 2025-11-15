import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpressionCheck } from './impression-check';

describe('ImpressionCheck', () => {
  let component: ImpressionCheck;
  let fixture: ComponentFixture<ImpressionCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpressionCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpressionCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
