package com.clientes.clientes_TCC.domain.Usuario;

import java.time.LocalDate;

public record UsuarioDTO(
        Integer id,
        String cpf,
        String nome,
        String email,
        String cep,
        String escolaridade,
        String profissao,
        String genero,
        LocalDate dataNascimento
) {
}
