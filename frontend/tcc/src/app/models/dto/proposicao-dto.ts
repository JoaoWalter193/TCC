import { TipoProposicao } from "./tipo-proposicao-enum";

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
    vereador: string;
    likes: number;
    dislikes: number;
    idVisualizado?: number;
}