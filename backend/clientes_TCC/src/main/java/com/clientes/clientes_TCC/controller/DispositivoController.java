package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.DispositivoRegistrarDTO;
import com.clientes.clientes_TCC.service.DispositivoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dispositivos")
@Tag(name = "Dispositivos", description = "Registro e remoção de dispositivos para notificações push (FCM)")
public class DispositivoController {

    @Autowired
    private DispositivoService dispositivoService;

    @Operation(summary = "Registrar token do dispositivo", description = "Associa um token FCM a um usuário para permitir o envio de notificações push para o dispositivo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content)
    })
    @PostMapping
    public ResponseEntity<ResponseDTO> registrarToken(@RequestBody DispositivoRegistrarDTO data) {
        return dispositivoService.registrarToken(data);
    }

    @Operation(summary = "Remover token do dispositivo", description = "Remove o registro de um token FCM, impedindo o envio de notificações push para aquele dispositivo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token removido com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Token não encontrado", content = @Content)
    })
    @DeleteMapping("/{fcmToken}")
    public ResponseEntity<ResponseDTO> removerToken(
            @Parameter(description = "Token FCM do dispositivo", example = "fcm-token-exemplo-123", required = true)
            @PathVariable String fcmToken) {
        return dispositivoService.removerToken(fcmToken);
    }
}