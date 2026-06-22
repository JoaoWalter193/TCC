package com.clientes.clientes_TCC.domain.Usuario;

import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoResumoDTO;

import java.time.LocalDate;
import java.util.List;

public record UsuarioPerfilDTO(
        Integer id,
        String cpf,
        String nome,
        String email,
        String cep,
        String escolaridade,
        String profissao,
        String genero,
        LocalDate dataNascimento,
        Integer totalVereadoresSeguidos,
        List<ProposicaoResumoDTO> proposicoesFavoritas
) {
}
