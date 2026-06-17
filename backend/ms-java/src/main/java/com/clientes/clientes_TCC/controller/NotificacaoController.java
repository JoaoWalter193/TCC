package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Notificacao.Notificacao;
import com.clientes.clientes_TCC.domain.Notificacao.NotificacaoTesteDTO;
import com.clientes.clientes_TCC.service.NotificacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
@Tag(name = "Notificações", description = "Gerenciamento de notificações do usuário")
public class NotificacaoController {

    @Autowired
    private NotificacaoService notificacaoService;

    @Operation(summary = "Listar notificações", description = "Retorna todas as notificações de um usuário, ordenadas da mais recente para a mais antiga")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de notificações retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<Notificacao>> listarNotificacoes(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return notificacaoService.listarNotificacoes(usuarioId);
    }

    @Operation(summary = "Listar notificações não lidas", description = "Retorna apenas as notificações ainda não lidas de um usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de notificações não lidas retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping("/{usuarioId}/nao-lidas")
    public ResponseEntity<List<Notificacao>> listarNaoLidas(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return notificacaoService.listarNaoLidas(usuarioId);
    }

    @Operation(summary = "Marcar notificação como lida", description = "Marca uma notificação específica como lida pelo seu ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notificação marcada como lida com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Notificação não encontrada", content = @Content)
    })
    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(
            @Parameter(description = "ID da notificação", example = "1", required = true)
            @PathVariable Integer id) {
        return notificacaoService.marcarComoLida(id);
    }

    @Operation(summary = "Marcar todas como lidas", description = "Marca todas as notificações de um usuário como lidas de uma só vez")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Todas as notificações foram marcadas como lidas"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @PatchMapping("/{usuarioId}/marcar-todas-lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return notificacaoService.marcarTodasComoLidas(usuarioId);
    }

    @Operation(summary = "Testar notificação", description = "Dispara manualmente uma notificação de teste para um usuário")
    @PostMapping("/{usuarioId}/teste")
    public ResponseEntity<Notificacao> testarNotificacao(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @RequestBody NotificacaoTesteDTO dto) {
        Notificacao notif = notificacaoService.criarNotificacao(
                usuarioId,
                dto.titulo(),
                dto.mensagem(),
                dto.proposicaoCodigo()
        );
        return ResponseEntity.ok(notif);
    }
}