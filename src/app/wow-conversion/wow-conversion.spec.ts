import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WowConversion } from './wow-conversion';

describe('WowConversion', () => {
  let component: WowConversion;
  let fixture: ComponentFixture<WowConversion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WowConversion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WowConversion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
