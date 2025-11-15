import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdcopyCheck } from './adcopy-check';

describe('AdcopyCheck', () => {
  let component: AdcopyCheck;
  let fixture: ComponentFixture<AdcopyCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdcopyCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdcopyCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
