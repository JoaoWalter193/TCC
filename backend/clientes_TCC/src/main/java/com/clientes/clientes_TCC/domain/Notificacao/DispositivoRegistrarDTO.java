package com.clientes.clientes_TCC.domain.Notificacao;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados para registrar um dispositivo para notificações push")
public record DispositivoRegistrarDTO(
        @Schema(description = "ID do usuário dono do dispositivo", example = "1")
        Integer usuarioId,

        @Schema(description = "Token FCM do dispositivo", example = "fcm-token-exemplo-123-abc")
        String fcmToken
) {}