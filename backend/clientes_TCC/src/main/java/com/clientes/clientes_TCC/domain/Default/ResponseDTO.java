package com.clientes.clientes_TCC.domain.Default;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta padrão da API com código e mensagem descritiva")
public record ResponseDTO(
        @Schema(description = "Código da resposta", example = "200")
        String cod,

        @Schema(description = "Mensagem descritiva da resposta", example = "Operação realizada com sucesso")
        String desc
) {
}
