import { Injectable } from '@angular/core';
import { Observable, map, switchMap, of } from 'rxjs';
import { ProposicaoListaDTO, ProposicaoDetalheDTO, ProposicaoDTO, PageResponse } from '../models/dto/proposicao-dto';
import { ApiGatewayService } from './api-gateway.service';

export function mapListaToListaDTO(item: ProposicaoListaDTO): ProposicaoDTO {
  return {
    id: item.codigo,
    tipoProposicao: item.tipo,
    dataDeEnvio: item.dataEnvio,
    dataEfetivo: '',
    localizacao: '',
    ultimoTramite: '',
    razao: item.razao,
    tag: item.tag,
    tramiteAlternativo: false,
    encerrouTramitacao: item.estado !== 'Em tramitação',
    leisSimilares: [],
    ementa: item.ementa,
    texto: '',
    justificativa: '',
    vereador: {
      id: item.vereadorId,
      nome: item.vereadorNome,
      partido: '',
      avatarUrl: item.vereadorAvatarUrl
    },
    likes: item.likes ?? 0,
    dislikes: item.dislikes ?? 0,
    currentUserReaction: item.currentUserReaction ?? null,
    isFavorito: false,
  };
}

export function mapDetalheToDTO(item: ProposicaoDetalheDTO): ProposicaoDTO {
  return {
    id: item.codigo,
    tipoProposicao: item.tipoNome,
    dataDeEnvio: item.dataEnvio,
    dataEfetivo: item.dataEfetivo,
    localizacao: item.localizacao,
    ultimoTramite: item.ultimoTramite,
    razao: item.razao,
    tag: item.tag,
    tramiteAlternativo: item.tramiteAlternativo,
    encerrouTramitacao: item.encerrouTramitacao,
    leisSimilares: item.leisSimilares ? item.leisSimilares.split(',').map(s => s.trim()).filter(s => s) : [],
    ementa: item.ementa,
    texto: item.texto,
    justificativa: item.justificativa,
    vereador: {
      id: item.vereadorId,
      nome: item.vereadorNome,
      partido: item.vereadorPartido,
      avatarUrl: item.vereadorAvatarUrl
    },
    likes: item.likes ?? 0,
    dislikes: item.dislikes ?? 0,
    currentUserReaction: item.currentUserReaction ?? null,
    isFavorito: false,
  };
}

@Injectable({ providedIn: 'root' })
export class ProposicaoService {
  constructor(private api: ApiGatewayService) {}

  private mergeFavoritos(posts: ProposicaoDTO[], usuarioId: number | null): Observable<ProposicaoDTO[]> {
    if (!usuarioId) return of(posts);
    return this.api.v1.get<ProposicaoListaDTO[]>(`/user/${usuarioId}/fav`).pipe(
      map(favs => {
        const favCodigos = new Set(favs.map(f => f.codigo));
        return posts.map(p => ({ ...p, isFavorito: favCodigos.has(p.id) }));
      }),
    );
  }

  listar(usuarioId?: number | null): Observable<ProposicaoDTO[]> {
    const params: Record<string, string | number> = { size: 200 };
    if (usuarioId != null) { params['usuarioId'] = usuarioId; }
    return this.api.v1.get<PageResponse<ProposicaoListaDTO>>('/prop', params).pipe(
      map(res => res.content.map(mapListaToListaDTO)),
      switchMap(posts => this.mergeFavoritos(posts, usuarioId ?? null)),
    );
  }

  listarPaginado(usuarioId: number | null | undefined, page = 0, size = 20): Observable<PageResponse<ProposicaoDTO>> {
    const params: Record<string, string | number> = { page, size };
    if (usuarioId != null) { params['usuarioId'] = usuarioId; }
    return this.api.v1.get<PageResponse<ProposicaoListaDTO>>('/prop', params).pipe(
      switchMap(res => {
        const items = res.content.map(mapListaToListaDTO);
        return this.mergeFavoritos(items, usuarioId ?? null).pipe(
          map(favItems => ({
            content: favItems,
            totalElements: res.totalElements,
            totalPages: res.totalPages,
            number: res.number,
            size: res.size,
          })),
        );
      }),
    );
  }

  buscarPorId(id: number, usuarioId?: number | null): Observable<ProposicaoDTO | undefined> {
    const params: Record<string, string | number> = {};
    if (usuarioId != null) { params['usuarioId'] = usuarioId; }
    return this.api.v1.get<ProposicaoDetalheDTO>(`/prop/${id}`, params).pipe(
      map(d => mapDetalheToDTO(d)),
      switchMap(post => {
        if (!post || !usuarioId) return of(post);
        return this.api.v1.get<ProposicaoListaDTO[]>(`/user/${usuarioId}/fav`).pipe(
          map(favs => { post.isFavorito = favs.some(f => f.codigo === post.id); return post; }),
        );
      }),
    );
  }

  listarPorVereador(vereadorId: number, usuarioId?: number | null): Observable<ProposicaoDTO[]> {
    const params: Record<string, string | number> = {};
    if (usuarioId != null) { params['usuarioId'] = usuarioId; }
    return this.api.v1.get<ProposicaoListaDTO[]>(`/prop/vereador/${vereadorId}`, params).pipe(
      map(lista => lista.map(mapListaToListaDTO)),
      switchMap(posts => this.mergeFavoritos(posts, usuarioId ?? null)),
    );
  }

  buscarPorSimilaridade(q: string, limit = 10, usuarioId?: number | null): Observable<ProposicaoDTO[]> {
    const params: Record<string, string | number> = { q, limit };
    if (usuarioId != null) { params['usuarioId'] = usuarioId; }
    return this.api.v1.get<ProposicaoListaDTO[]>('/prop/busca', params).pipe(
      map(lista => lista.map(mapListaToListaDTO)),
      switchMap(posts => this.mergeFavoritos(posts, usuarioId ?? null)),
    );
  }

  buscarPorNomeVereador(q: string, usuarioId?: number | null): Observable<ProposicaoDTO[]> {
    const params: Record<string, string | number> = { q };
    if (usuarioId != null) { params['usuarioId'] = usuarioId; }
    return this.api.v1.get<ProposicaoListaDTO[]>('/prop/busca/vereador', params).pipe(
      map(lista => lista.map(mapListaToListaDTO)),
      switchMap(posts => this.mergeFavoritos(posts, usuarioId ?? null)),
    );
  }
}
