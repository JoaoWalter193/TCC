package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.service.SseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/sse")
@Tag(name = "SSE (Server-Sent Events)", description = "Conexão em tempo real para receber notificações via Server-Sent Events")
public class SseController {

    @Autowired
    private SseService sseService;

    @Operation(summary = "Conectar ao stream SSE", description = "Estabelece uma conexão SSE para receber notificações em tempo real. O frontend deve manter esta conexão aberta para ouvir eventos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conexão SSE estabelecida com sucesso (stream contínuo)"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content)
    })
    @GetMapping(value = "/{usuarioId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter conectar(
            @Parameter(description = "ID do usuário para receber notificações", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return sseService.conectar(usuarioId);
    }
}