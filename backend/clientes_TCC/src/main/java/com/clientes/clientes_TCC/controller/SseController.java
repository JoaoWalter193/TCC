package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/sse")
public class SseController {

    @Autowired
    private SseService sseService;

    // frontend conecta aqui para receber notificações em tempo real
    @GetMapping(value = "/{usuarioId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter conectar(@PathVariable Integer usuarioId) {
        return sseService.conectar(usuarioId);
    }
}