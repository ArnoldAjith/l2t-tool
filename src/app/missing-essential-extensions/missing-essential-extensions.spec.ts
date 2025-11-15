import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingEssentialExtensions } from './missing-essential-extensions';

describe('MissingEssentialExtensions', () => {
  let component: MissingEssentialExtensions;
  let fixture: ComponentFixture<MissingEssentialExtensions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissingEssentialExtensions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissingEssentialExtensions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
