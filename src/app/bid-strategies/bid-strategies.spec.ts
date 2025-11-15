import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidStrategies } from './bid-strategies';

describe('BidStrategies', () => {
  let component: BidStrategies;
  let fixture: ComponentFixture<BidStrategies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidStrategies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidStrategies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
