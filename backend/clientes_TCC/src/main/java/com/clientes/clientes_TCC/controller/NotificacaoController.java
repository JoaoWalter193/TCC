package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Notificacao.Notificacao;
import com.clientes.clientes_TCC.service.NotificacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    @Autowired
    private NotificacaoService notificacaoService;

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<Notificacao>> listarNotificacoes(@PathVariable Integer usuarioId) {
        return notificacaoService.listarNotificacoes(usuarioId);
    }

    @GetMapping("/{usuarioId}/nao-lidas")
    public ResponseEntity<List<Notificacao>> listarNaoLidas(@PathVariable Integer usuarioId) {
        return notificacaoService.listarNaoLidas(usuarioId);
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Integer id) {
        return notificacaoService.marcarComoLida(id);
    }

    @PatchMapping("/{usuarioId}/marcar-todas-lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(@PathVariable Integer usuarioId) {
        return notificacaoService.marcarTodasComoLidas(usuarioId);
    }
}