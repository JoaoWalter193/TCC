package com.clientes.clientes_TCC.domain.Default;

import com.clientes.clientes_TCC.domain.Usuario.UsuarioDTO;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta de login com dados do usuário e token JWT")
public record LoginResponseDTO(
        @Schema(description = "Dados do usuário autenticado")
        UsuarioDTO usuario,

        @Schema(description = "Token JWT para autenticação", example = "eyJhbGciOiJIUzI1NiIs...")
        String token
) {
}
