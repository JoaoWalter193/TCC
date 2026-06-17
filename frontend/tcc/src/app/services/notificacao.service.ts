import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacaoDTO, NotificacaoViewModel, NotificacaoTipo } from '../models/dto/notificacao-dto';
import { ApiGatewayService } from './api-gateway.service';
import { AuthService } from './auth.service';
import { SseService } from './sse.service';
import { LocalNotificationService } from './local-notification.service';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly STORAGE_KEY = 'notificacoes_lidas';
  private api = inject(ApiGatewayService);
  private sse = inject(SseService);
  private localNotif = inject(LocalNotificationService);

  private notificacoes = signal<NotificacaoViewModel[]>([]);
  private naoLidas = signal(0);
  private estaNaPagina = signal(false);
  private ultimoUsuarioId = 0;
  private idsAgendados = new Set<number>();
  private primeiraCarga = true;

  readonly notificacoesSig = this.notificacoes.asReadonly();
  readonly naoLidasSig = this.naoLidas.asReadonly();
  readonly estaNaPaginaSig = this.estaNaPagina.asReadonly();

  constructor() {
    this.sse.evento$.subscribe(() => {
      if (this.ultimoUsuarioId) {
        this.carregarNotificacoes(this.ultimoUsuarioId);
      }
    });

    inject(AuthService).reset$.subscribe(() => {
      this.limparEstado();
    });
  }

  setEstaNaPagina(value: boolean): void {
    this.estaNaPagina.set(value);
  }

  carregarNotificacoes(usuarioId: number): void {
    this.ultimoUsuarioId = usuarioId;

    if (!this.sse.conectado) {
      this.sse.conectar(usuarioId);
    }

    this.api.v1.get<NotificacaoDTO[]>(`/notificacoes/${usuarioId}`).pipe(
      catchError(() => of([] as NotificacaoDTO[])),
    ).subscribe({
      next: (lista) => {
        const lidasStorage = this.lerLidasStorage();
        const enriquecidas = this.enriquecerLista(lista);

        const comEstado = enriquecidas.map(n => ({
          ...n,
          lida: n.lida || lidasStorage.has(n.id),
        }));

        const anterior = this.notificacoes();

        this.notificacoes.set(comEstado);
        this.atualizarContador();

        if (!this.primeiraCarga) {
          this.agendarNovas(comEstado, anterior);
        }
        this.primeiraCarga = false;
      },
      error: () => {
        this.notificacoes.set([]);
        this.naoLidas.set(0);
      },
    });
  }

  marcarComoLida(id: number): void {
    this.api.v1.patch<void>(`/notificacoes/${id}/lida`, {}).pipe(
      catchError(() => of(void 0)),
    ).subscribe();

    this.notificacoes.update(lista =>
      lista.map(n => (n.id === id ? { ...n, lida: true } : n)),
    );
    this.persistirLida(id);
    this.atualizarContador();
  }

  marcarTodasComoLidas(): void {
    const ids = this.notificacoes().filter(n => !n.lida).map(n => n.id);
    if (!ids.length) return;

    const usuarioId = this.notificacoes()[0]?.usuarioId;
    if (usuarioId) {
      this.api.v1.patch<void>(`/notificacoes/${usuarioId}/marcar-todas-lidas`, {}).pipe(
        catchError(() => of(void 0)),
      ).subscribe();
    }

    this.notificacoes.update(lista =>
      lista.map(n => ({ ...n, lida: true })),
    );
    ids.forEach(id => this.persistirLida(id));
    this.atualizarContador();
  }

  excluirTodas(usuarioId: number): void {
    this.api.v1.delete(`/notificacoes/${usuarioId}`).pipe(
      catchError(() => of(void 0)),
    ).subscribe();

    this.localNotif.cancelarTodas();
    this.notificacoes.set([]);
    this.naoLidas.set(0);
    this.idsAgendados.clear();
    this.primeiraCarga = true;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch { /* ignora */ }
  }

  limparEstado(): void {
    this.notificacoes.set([]);
    this.naoLidas.set(0);
    this.ultimoUsuarioId = 0;
    this.idsAgendados.clear();
    this.primeiraCarga = true;
    this.sse.desconectar();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch { /* ignora */ }
  }

  private agendarNovas(atual: NotificacaoViewModel[], anterior: NotificacaoViewModel[]): void {
    const idsAnteriores = new Set(anterior.map(n => n.id));

    for (const notif of atual) {
      if (notif.lida) continue;
      if (this.idsAgendados.has(notif.id)) continue;

      if (!idsAnteriores.has(notif.id)) {
        this.idsAgendados.add(notif.id);
        this.localNotif.agendar(
          notif.id,
          notif.titulo,
          notif.mensagem,
          { proposicaoCodigo: notif.proposicaoCodigo },
        );
      }
    }
  }

  private atualizarContador(): void {
    const count = this.notificacoes().filter(n => !n.lida).length;
    this.naoLidas.set(count);
  }

  private lerLidasStorage(): Set<number> {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private persistirLida(id: number): void {
    const lidas = this.lerLidasStorage();
    lidas.add(id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...lidas]));
  }

  private enriquecerLista(lista: NotificacaoDTO[]): NotificacaoViewModel[] {
    return lista.map(n => {
      const tipo = this.detectarTipo(n);
      const tempoRelativo = this.calcularTempoRelativo(n.criadaEm);
      const viewModel: NotificacaoViewModel = {
        ...n,
        tipo,
        tempoRelativo,
      };

      if (tipo === 'vereador') {
        viewModel.vereadorNome = this.extrairNomeVereador(n.titulo);
        viewModel.proposicaoTitulo = n.mensagem;
      }

      return viewModel;
    });
  }

  private detectarTipo(n: NotificacaoDTO): NotificacaoTipo {
    const titulo = n.titulo?.toLowerCase() ?? '';
    if (
      titulo.includes('nova proposição') ||
      titulo.includes('publicou') ||
      titulo.includes('alterou suas informações')
    ) {
      return 'vereador';
    }
    return 'proposicao';
  }

  private extrairNomeVereador(titulo: string): string {
    const match = titulo.match(/(?:Nova proposição de |publicou uma nova proposição)/i);
    if (match) {
      return titulo.replace(match[0], '').trim();
    }
    const alteracao = titulo.match(/^([\w\sÀ-ÿ]+) alterou/i);
    if (alteracao) {
      return alteracao[1].trim();
    }
    return '';
  }

  private calcularTempoRelativo(dataStr: string): string {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Há ${diffD}d`;
    return data.toLocaleDateString('pt-BR');
  }
}
