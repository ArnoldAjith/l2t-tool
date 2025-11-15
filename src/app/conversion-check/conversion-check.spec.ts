import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionCheck } from './conversion-check';

describe('ConversionCheck', () => {
  let component: ConversionCheck;
  let fixture: ComponentFixture<ConversionCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversionCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
