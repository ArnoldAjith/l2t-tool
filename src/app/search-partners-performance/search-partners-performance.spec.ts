import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPartnersPerformance } from './search-partners-performance';

describe('SearchPartnersPerformance', () => {
  let component: SearchPartnersPerformance;
  let fixture: ComponentFixture<SearchPartnersPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPartnersPerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPartnersPerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
