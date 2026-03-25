import { TestBed } from '@angular/core/testing';

import { DashboardMode } from '../dashboard-mode';

describe('DashboardMode', () => {
  let service: DashboardMode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardMode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
