package com.clientes.clientes_TCC.domain.Proposicao;

import java.time.LocalDateTime;

public record ProposicaoEspecificaDTO(
        Long codigo,
        String tipoNome,
        Integer vereadorId,
        String vereadorNome,
        String vereadorPartido,
        String vereadorAvatarUrl,
        LocalDateTime dataEnvio,
        LocalDateTime dataEfetivo,
        String estadoNome,
        String localizacao,
        LocalDateTime ultimoTramite,
        String razao,
        Boolean tramiteAlternativo,
        Boolean encerrouTramitacao,
        String leisSimilares,
        String ementa,
        String texto,
        String justificativa,
        String tag,
        Integer likes,
        Integer dislikes,
        String currentUserReaction
) {
}
