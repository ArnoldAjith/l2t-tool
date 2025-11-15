import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageTargetingAccuracy } from './language-targeting-accuracy';

describe('LanguageTargetingAccuracy', () => {
  let component: LanguageTargetingAccuracy;
  let fixture: ComponentFixture<LanguageTargetingAccuracy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageTargetingAccuracy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageTargetingAccuracy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
