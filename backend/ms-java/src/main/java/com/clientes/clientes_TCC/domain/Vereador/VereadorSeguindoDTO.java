package com.clientes.clientes_TCC.domain.Vereador;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resumo do vereador para listagem de seguidos")
public record VereadorSeguindoDTO(
        @Schema(description = "ID do vereador", example = "1")
        Integer id,

        @Schema(description = "Nome do vereador", example = "João Silva")
        String nome,

        @Schema(description = "Sigla do partido", example = "PT")
        String partido,

        @Schema(description = "Situação de atividade", example = "Ativo")
        String ativo,

        @Schema(description = "Email do vereador", example = "joao.silva@camara.gov.br")
        String email,

        @Schema(description = "Site do vereador", example = "https://www.camara.gov.br/vereador/joao-silva")
        String site
) {}