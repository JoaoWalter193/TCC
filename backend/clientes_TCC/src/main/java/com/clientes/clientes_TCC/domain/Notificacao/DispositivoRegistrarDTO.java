package com.clientes.clientes_TCC.domain.Notificacao;

public record DispositivoRegistrarDTO(
        Integer usuarioId,
        String fcmToken
) {}