import { Injectable, NgZone, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SseNotificacaoEvent {
  titulo: string;
  mensagem: string;
  proposicaoCodigo?: number;
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private zone = inject(NgZone);
  private eventSource: EventSource | null = null;
  private eventSubject = new Subject<SseNotificacaoEvent>();
  readonly evento$ = this.eventSubject.asObservable();

  conectar(usuarioId: number): void {
    this.desconectar();
    const url = `${environment.gatewayUrl}/api/v1/sse/${usuarioId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('notificacao', (event: MessageEvent) => {
      try {
        const data: SseNotificacaoEvent = JSON.parse(event.data);
        this.zone.run(() => this.eventSubject.next(data));
      } catch { /* ignora erros de parse */ }
    });

    this.eventSource.onerror = () => {};
  }

  desconectar(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  get conectado(): boolean {
    return this.eventSource !== null;
  }
}
