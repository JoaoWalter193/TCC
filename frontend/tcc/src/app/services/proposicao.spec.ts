import { TestBed } from '@angular/core/testing';

import { ProposicaoService } from './proposicao';

describe('ProposicaoService', () => {
  let service: ProposicaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposicaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
