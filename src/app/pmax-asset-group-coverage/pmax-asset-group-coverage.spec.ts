import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmaxAssetGroupCoverage } from './pmax-asset-group-coverage';

describe('PmaxAssetGroupCoverage', () => {
  let component: PmaxAssetGroupCoverage;
  let fixture: ComponentFixture<PmaxAssetGroupCoverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmaxAssetGroupCoverage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmaxAssetGroupCoverage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
