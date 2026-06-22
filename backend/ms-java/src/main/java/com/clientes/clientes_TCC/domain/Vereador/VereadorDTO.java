package com.clientes.clientes_TCC.domain.Vereador;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Date;

@Schema(description = "Dados completos de um vereador")
public record VereadorDTO(
        @Schema(description = "ID do vereador", example = "1")
        Integer id,

        @Schema(description = "Nome completo do vereador", example = "João Silva")
        String nome,

        @Schema(description = "Sigla do partido político", example = "PT")
        String partido,

        @Schema(description = "Email de contato do vereador", example = "joao.silva@camara.gov.br")
        String email,

        @Schema(description = "Legislaturas em que o vereador atuou", example = "2021-2024, 2025-2028")
        String legislaturas,

        @Schema(description = "Número do gabinete", example = "405")
        String gabinete,

        @Schema(description = "Telefone de contato", example = "(11) 1234-5678")
        String telefone,

        @Schema(description = "Site oficial do vereador", example = "https://www.camara.gov.br/vereador/joao-silva")
        String site,

        @Schema(description = "Situação de atividade do vereador")
        VereadorAtivo vereador_ativo,

        @Schema(description = "Gênero do vereador", example = "Masculino")
        String genero,

        @Schema(description = "Data de nascimento", example = "1975-03-15")
        Date dataNasc,

        @Schema(description = "Declaração de cor/raça")
        VereadorCor vereador_cor,

        @Schema(description = "Ocupação profissional", example = "Advogado")
        String ocupacao,

        @Schema(description = "Escolaridade")
        VereadorEscolaridade vereador_escolaridade,

        @Schema(description = "Quantidade de seguidores", example = "42")
        Integer seguidores,

        @Schema(description = "URL do avatar do vereador", example = "https://www.cmc.pr.gov.br/fotos/vereador.jpg")
        String avatarUrl
) {
}
