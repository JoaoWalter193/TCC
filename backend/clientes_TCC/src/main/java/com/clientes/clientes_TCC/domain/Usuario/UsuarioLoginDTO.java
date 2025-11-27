package com.clientes.clientes_TCC.domain.Usuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioLoginDTO(
        @Schema(
                description = "Email do usuário",
                example = "carlos.silva@email.com",
                format = "email"
        )
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido")
        String email,

        @Schema(
                description = "Senha do usuário (mínimo 6 caracteres)",
                example = "123"
        )
        @NotBlank(message = "Senha é obrigatória")
        String senha) {
}
