import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdCopyBrandComplianceSpelling } from './ad-copy-brand-compliance-spelling';

describe('AdCopyBrandComplianceSpelling', () => {
  let component: AdCopyBrandComplianceSpelling;
  let fixture: ComponentFixture<AdCopyBrandComplianceSpelling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdCopyBrandComplianceSpelling]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdCopyBrandComplianceSpelling);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
