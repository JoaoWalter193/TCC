import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardMode {
  private modoSelecionado = new BehaviorSubject<string>('dashboard');
  
  modoSelecionado$ = this.modoSelecionado.asObservable();

  setModo(modo: string) {
    this.modoSelecionado.next(modo);
  }
}
