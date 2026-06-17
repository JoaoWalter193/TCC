package com.clientes.clientes_TCC.domain.Usuario;

public record UsuarioAtualizarDTO(
        String nome,
        String email,
        String senhaAntiga,
        String senhaNova,
        String senhaNovaNovamente,
        String cep,
        String escolaridade,
        String profissao
) {
}
