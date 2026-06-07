import { TestBed } from '@angular/core/testing';

import { VereadorService } from './vereador';

describe('VereadorService', () => {
  let service: VereadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VereadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
