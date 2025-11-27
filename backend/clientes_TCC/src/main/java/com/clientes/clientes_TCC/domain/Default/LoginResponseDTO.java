package com.clientes.clientes_TCC.domain.Default;

import com.clientes.clientes_TCC.domain.Usuario.UsuarioDTO;

public record LoginResponseDTO(
        UsuarioDTO usuario,
        String token
) {
}
