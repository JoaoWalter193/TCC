import { TipoProposicao } from "./tipo-proposicao-enum";
import { VereadorDTO } from "./vereador-dto";

export interface ProposicaoDTO {
    id: number;
    tipoProposicao: TipoProposicao;
    dataDeEnvio: Date;
    dataEfetivo: Date;
    localizacao: string;
    ultimoTramite: Date;
    razao: string;
    tag: string;
    tramiteAlternativo: boolean;
    encerrouTramitacao: boolean;
    leisSimilares: string[];
    ementa: string;
    texto: string;
    justificativa: string;
    vereador: VereadorDTO;
    likes: number;
    dislikes: number;
    idVisualizado?: number;
}