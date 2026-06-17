package com.clientes.clientes_TCC.domain.Usuario;

public record UsuarioDTO(
        Integer id,
        String cpf,
        String nome,
        String email,
        String cep,
        String escolaridade,
        String profissao
) {
}
