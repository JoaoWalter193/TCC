import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProposicaoListaDTO, ProposicaoDetalheDTO, ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ApiGatewayService } from './api-gateway.service';

function mapListaToListaDTO(item: ProposicaoListaDTO): ProposicaoDTO {
  return {
    id: item.codigo,
    tipoProposicao: item.tipo,
    dataDeEnvio: item.dataEnvio,
    dataEfetivo: '',
    localizacao: '',
    ultimoTramite: '',
    razao: item.ementa.substring(0, 60),
    tag: item.tag,
    tramiteAlternativo: false,
    encerrouTramitacao: item.estado !== 'Em tramitação',
    leisSimilares: [],
    ementa: item.ementa,
    texto: '',
    justificativa: '',
    vereador: {
      id: 0,
      nome: item.vereadorNome,
      partido: '',
    },
    likes: 0,
    dislikes: 0,
  };
}

function mapDetalheToDTO(item: ProposicaoDetalheDTO): ProposicaoDTO {
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
      id: 0,
      nome: item.vereadorNome,
      partido: item.vereadorPartido,
    },
    likes: 0,
    dislikes: 0,
  };
}

@Injectable({ providedIn: 'root' })
export class ProposicaoService {
  constructor(private api: ApiGatewayService) {}

  listar(): Observable<ProposicaoDTO[]> {
    return this.api.v1.get<{ content: ProposicaoListaDTO[] }>('/prop?size=50')
      .pipe(map(res => res.content.map(mapListaToListaDTO)));
  }

  buscarPorId(id: number): Observable<ProposicaoDTO | undefined> {
    return this.api.v1.get<ProposicaoDetalheDTO>(`/prop/${id}`)
      .pipe(map(d => mapDetalheToDTO(d)));
  }

  buscarPorSimilaridade(q: string, limit = 10): Observable<ProposicaoDTO[]> {
    return this.api.v1.get<ProposicaoListaDTO[]>('/prop/busca', { q, limit })
      .pipe(map(lista => lista.map(mapListaToListaDTO)));
  }
}
