package com.clientes.clientes_TCC.domain.Proposicao;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Resumo de uma proposição para listagem")
public record ProposicaoListaResponseDTO(
        @Schema(description = "Código identificador da proposição", example = "12345")
        Long codigo,

        @Schema(description = "Tipo da proposição", example = "Projeto de Lei")
        String tipo,

        @Schema(description = "ID do vereador autor", example = "1")
        Integer vereadorId,

        @Schema(description = "Nome do vereador autor", example = "João Silva")
        String vereadorNome,

        @Schema(description = "Data de envio da proposição", example = "2024-03-15T10:30:00")
        LocalDateTime dataEnvio,

        @Schema(description = "Título (razão) da proposição", example = "Melhoria educacional")
        String razao,

        @Schema(description = "Ementa (resumo) da proposição", example = "Dispõe sobre a criação do programa de coleta seletiva")
        String ementa,

        @Schema(description = "Tag de categorização", example = "Meio Ambiente")
        String tag,

        @Schema(description = "Estado atual da tramitação", example = "Em tramitação")
        String estado,

        @Schema(description = "Quantidade de likes", example = "15")
        Integer likes,

        @Schema(description = "Quantidade de dislikes", example = "3")
        Integer dislikes,

        @Schema(description = "Reação do usuário logado (LIKE, DISLIKE ou null)", example = "LIKE")
        String currentUserReaction
) {
}
