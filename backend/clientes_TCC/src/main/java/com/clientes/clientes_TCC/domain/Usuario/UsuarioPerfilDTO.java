package com.clientes.clientes_TCC.domain.Usuario;

import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoResumoDTO;
import java.util.List;

public record UsuarioPerfilDTO(
        String cpf,
        String nome,
        String email,
        String cep,
        String escolaridade,
        String profissao,
        Integer totalVereadoresSeguidos,
        List<ProposicaoResumoDTO> proposicoesFavoritas
) {
}
