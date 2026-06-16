import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Tab5ModoService {
  private modo = new BehaviorSubject<'favoritos' | 'seguindo'>('favoritos');

  modo$ = this.modo.asObservable();

  setModo(modo: 'favoritos' | 'seguindo') {
    this.modo.next(modo);
  }
}
