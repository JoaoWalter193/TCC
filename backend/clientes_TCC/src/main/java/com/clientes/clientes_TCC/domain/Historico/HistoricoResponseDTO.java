package com.clientes.clientes_TCC.domain.Historico;

import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;

import java.time.LocalDateTime;

public record HistoricoResponseDTO(
    Long id,
    String tipo,
    LocalDateTime dataAcesso,
    ProposicaoListaResponseDTO proposicao,
    VereadorDTO vereador
) {
    public static HistoricoResponseDTO deProposicao(Long codigo, LocalDateTime dataAcesso, ProposicaoListaResponseDTO dto) {
        return new HistoricoResponseDTO(codigo, "PROPOSICAO", dataAcesso, dto, null);
    }

    public static HistoricoResponseDTO deVereador(Integer vereadorId, LocalDateTime dataAcesso, VereadorDTO dto) {
        return new HistoricoResponseDTO(vereadorId.longValue(), "VEREADOR", dataAcesso, null, dto);
    }
}
