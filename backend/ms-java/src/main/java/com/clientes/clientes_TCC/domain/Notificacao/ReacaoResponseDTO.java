package com.clientes.clientes_TCC.domain.Notificacao;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Reação de um usuário a uma proposição")
public record ReacaoResponseDTO(
        @Schema(description = "Código da proposição", example = "12345")
        Long proposicaoCodigo,

        @Schema(description = "Tipo da reação", example = "LIKE")
        String tipo,

        @Schema(description = "Data da reação", example = "2024-03-15T10:30:00")
        LocalDateTime criadaEm
) {
}
