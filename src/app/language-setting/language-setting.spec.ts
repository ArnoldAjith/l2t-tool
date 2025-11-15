import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSetting } from './language-setting';

describe('LanguageSetting', () => {
  let component: LanguageSetting;
  let fixture: ComponentFixture<LanguageSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageSetting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
