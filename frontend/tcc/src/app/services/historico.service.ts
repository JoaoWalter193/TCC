import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { HistoricoItem, HistoricoResponseDTO } from '../models/historico.model';

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private api = inject(ApiGatewayService);

  listar(): Observable<HistoricoItem[]> {
    return this.api.v1.get<HistoricoResponseDTO[]>('/historico').pipe(
      map((lista) =>
        lista.map((item) => {
          if (item.tipo === 'PROPOSICAO' && item.proposicao) {
            const dto = item.proposicao;
            return {
              id: dto.codigo,
              tipo: 'PROPOSICAO' as const,
              dataAcesso: item.dataAcesso,
              componente: {
                id: dto.codigo,
                tipoProposicao: dto.tipo,
                dataDeEnvio: dto.dataEnvio,
                dataEfetivo: '',
                localizacao: '',
                ultimoTramite: '',
                razao: '',
                tag: dto.tag,
                tramiteAlternativo: false,
                encerrouTramitacao: false,
                leisSimilares: [] as string[],
                ementa: dto.ementa,
                texto: dto.ementa,
                justificativa: '',
                vereador: {
                  id: dto.vereadorId,
                  nome: dto.vereadorNome,
                  partido: '',
                },
                likes: dto.likes,
                dislikes: dto.dislikes,
                currentUserReaction: dto.currentUserReaction,
                isFavorito: false,
              },
            } as HistoricoItem;
          }

          if (item.tipo === 'VEREADOR' && item.vereador) {
            return {
              id: item.id,
              tipo: 'VEREADOR' as const,
              dataAcesso: item.dataAcesso,
              componente: item.vereador,
            } as HistoricoItem;
          }

          return null;
        }).filter((x): x is HistoricoItem => x !== null),
      ),
    );
  }
}
