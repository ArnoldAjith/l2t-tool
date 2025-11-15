import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlChecker } from './url-checker';

describe('UrlChecker', () => {
  let component: UrlChecker;
  let fixture: ComponentFixture<UrlChecker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlChecker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlChecker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
