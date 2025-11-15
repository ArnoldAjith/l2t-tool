import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroActiveKeywords } from './zero-active-keywords';

describe('ZeroActiveKeywords', () => {
  let component: ZeroActiveKeywords;
  let fixture: ComponentFixture<ZeroActiveKeywords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZeroActiveKeywords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZeroActiveKeywords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
