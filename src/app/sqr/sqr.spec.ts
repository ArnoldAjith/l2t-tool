import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sqr } from './sqr';

describe('Sqr', () => {
  let component: Sqr;
  let fixture: ComponentFixture<Sqr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sqr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sqr);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
