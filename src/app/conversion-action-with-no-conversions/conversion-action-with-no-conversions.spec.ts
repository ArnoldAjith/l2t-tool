import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionActionWithNoConversions } from './conversion-action-with-no-conversions';

describe('ConversionActionWithNoConversions', () => {
  let component: ConversionActionWithNoConversions;
  let fixture: ComponentFixture<ConversionActionWithNoConversions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionActionWithNoConversions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversionActionWithNoConversions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
