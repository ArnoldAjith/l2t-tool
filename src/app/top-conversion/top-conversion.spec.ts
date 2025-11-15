import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopConversion } from './top-conversion';

describe('TopConversion', () => {
  let component: TopConversion;
  let fixture: ComponentFixture<TopConversion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopConversion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopConversion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
