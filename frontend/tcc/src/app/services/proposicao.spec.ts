import { TestBed } from '@angular/core/testing';

import { Proposicao } from './proposicao';

describe('Proposicao', () => {
  let service: Proposicao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proposicao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
