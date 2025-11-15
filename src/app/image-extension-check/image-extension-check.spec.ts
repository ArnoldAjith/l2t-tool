import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageExtensionCheck } from './image-extension-check';

describe('ImageExtensionCheck', () => {
  let component: ImageExtensionCheck;
  let fixture: ComponentFixture<ImageExtensionCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageExtensionCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageExtensionCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
