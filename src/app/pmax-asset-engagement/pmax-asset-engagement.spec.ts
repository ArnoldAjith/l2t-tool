import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmaxAssetEngagement } from './pmax-asset-engagement';

describe('PmaxAssetEngagement', () => {
  let component: PmaxAssetEngagement;
  let fixture: ComponentFixture<PmaxAssetEngagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmaxAssetEngagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmaxAssetEngagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
