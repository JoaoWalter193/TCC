import { TestBed } from '@angular/core/testing';

import { Vereador } from './vereador';

describe('Vereador', () => {
  let service: Vereador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vereador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
