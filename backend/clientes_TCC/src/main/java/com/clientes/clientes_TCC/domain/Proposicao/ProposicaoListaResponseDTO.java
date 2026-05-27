package com.clientes.clientes_TCC.domain.Proposicao;

import java.time.LocalDateTime;

public record ProposicaoListaResponseDTO(
        Long codigo,
        String tipo,
        String vereadorNome,
        LocalDateTime dataEnvio,
        String ementa,
        String tag,
        String estado
) {
}
