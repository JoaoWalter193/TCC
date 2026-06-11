import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReacaoEventService {
  private source = new Subject<void>();
  reacaoAlterada$ = this.source.asObservable();

  emitir() {
    this.source.next();
  }
}
