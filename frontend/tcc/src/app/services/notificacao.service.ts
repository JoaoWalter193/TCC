import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotificacaoDTO, NotificacaoViewModel, NotificacaoTipo } from '../models/dto/notificacao-dto';
import { ApiGatewayService } from './api-gateway.service';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly STORAGE_KEY = 'notificacoes_lidas';

  private notificacoes = signal<NotificacaoViewModel[]>([]);
  private naoLidas = signal(0);
  private estaNaPagina = signal(false);

  readonly notificacoesSig = this.notificacoes.asReadonly();
  readonly naoLidasSig = this.naoLidas.asReadonly();
  readonly estaNaPaginaSig = this.estaNaPagina.asReadonly();

  constructor(private api: ApiGatewayService) {}

  setEstaNaPagina(value: boolean): void {
    this.estaNaPagina.set(value);
  }

  carregarNotificacoes(usuarioId: number): void {
    this.api.v1.get<NotificacaoDTO[]>(`/notificacoes/${usuarioId}`).pipe(
      catchError(() => of(this.carregarFallback())),
      map(lista => this.enriquecerLista(lista)),
    ).subscribe({
      next: (enriquecidas) => {
        const lidasStorage = this.lerLidasStorage();
        const comEstado = enriquecidas.map(n => ({
          ...n,
          lida: n.lida || lidasStorage.has(n.id),
        }));
        this.notificacoes.set(comEstado);
        this.atualizarContador();
      },
      error: () => {
        const fallback = this.enriquecerLista(this.carregarFallback());
        this.notificacoes.set(fallback);
        this.atualizarContador();
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

  private carregarFallback(): NotificacaoDTO[] {
    return [
      {
        id: 1, usuarioId: 1,
        titulo: 'Nova proposição de Angelo Vanhoni',
        mensagem: 'Institui Política Municipal de Educação Inovadora',
        lida: false, criadaEm: new Date(Date.now() - 1800000).toISOString(),
        proposicaoCodigo: 1,
      },
      {
        id: 2, usuarioId: 1,
        titulo: 'Atualização em proposição favoritada',
        mensagem: 'Dispõe sobre a criação do programa de coleta seletiva — Em tramitação',
        lida: false, criadaEm: new Date(Date.now() - 3600000).toISOString(),
        proposicaoCodigo: 3,
      },
      {
        id: 3, usuarioId: 1,
        titulo: 'Nova proposição de Camilla Gonda',
        mensagem: 'Cria salas sensoriais em escolas para apoio ao neurodesenvolvimento infantil',
        lida: true, criadaEm: new Date(Date.now() - 7200000).toISOString(),
        proposicaoCodigo: 2,
      },
      {
        id: 4, usuarioId: 1,
        titulo: 'Nova proposição de Rafaela Lupion',
        mensagem: 'Amplia bicicletários públicos com instalação em terminais de transporte',
        lida: false, criadaEm: new Date(Date.now() - 86400000).toISOString(),
        proposicaoCodigo: 6,
      },
      {
        id: 5, usuarioId: 1,
        titulo: 'Atualização em proposição favoritada',
        mensagem: 'Regula uso de vias públicas para ordenamento urbano — Aprovado',
        lida: true, criadaEm: new Date(Date.now() - 172800000).toISOString(),
        proposicaoCodigo: null,
      },
      {
        id: 6, usuarioId: 1,
        titulo: 'Angelo Vanhoni alterou suas informações de perfil',
        mensagem: 'O vereador atualizou seus dados cadastrais na câmara municipal',
        lida: false, criadaEm: new Date(Date.now() - 259200000).toISOString(),
        proposicaoCodigo: null,
      },
    ];
  }
}
