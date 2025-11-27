package com.clientes.clientes_TCC.domain.Usuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioCriarDTO(
        @Schema(
                description = "CPF do usuário (apenas números)",
                example = "07762143432",
                pattern = "\\d{11}",
                minLength = 11,
                maxLength = 11
        )
        @NotBlank(message = "CPF é obrigatório")
        @Size(min = 11, max = 11, message = "CPF deve ter 11 dígitos")
        String cpf,


        @Schema(
                description = "Nome completo do usuário",
                example = "Carlos Silva",
                minLength = 2,
                maxLength = 100
        )
        String nome,


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
        String senha,


        @Schema(
                description = "Confirmação da senha",
                example = "123"
        )
        @NotBlank(message = "Confirmação de senha é obrigatória")
        String senhaNovamente
) {
}
