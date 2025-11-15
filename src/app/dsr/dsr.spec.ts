import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dsr } from './dsr';

describe('Dsr', () => {
  let component: Dsr;
  let fixture: ComponentFixture<Dsr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dsr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dsr);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
