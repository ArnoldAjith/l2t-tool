import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordConflictsDetection } from './keyword-conflicts-detection';

describe('KeywordConflictsDetection', () => {
  let component: KeywordConflictsDetection;
  let fixture: ComponentFixture<KeywordConflictsDetection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeywordConflictsDetection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeywordConflictsDetection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
