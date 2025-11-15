import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationSettings } from './location-settings';

describe('LocationSettings', () => {
  let component: LocationSettings;
  let fixture: ComponentFixture<LocationSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
