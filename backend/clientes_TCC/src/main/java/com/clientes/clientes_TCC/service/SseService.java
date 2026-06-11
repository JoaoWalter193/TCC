package com.clientes.clientes_TCC.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    // mapa de usuarioId -> conexão SSE ativa
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter conectar(Integer usuarioId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onCompletion(() -> emitters.remove(usuarioId));
        emitter.onTimeout(() -> emitters.remove(usuarioId));
        emitter.onError(e -> emitters.remove(usuarioId));

        emitters.put(usuarioId, emitter);
        return emitter;
    }

    public void enviarNotificacao(Integer usuarioId, String titulo, String mensagem, Long proposicaoCodigo) {
        SseEmitter emitter = emitters.get(usuarioId);
        if (emitter != null) {
            try {
                String json = String.format(
                    "{\"titulo\":\"%s\",\"mensagem\":\"%s\",\"proposicaoCodigo\":%d}",
                    titulo.replace("\"", "\\\""),
                    mensagem.replace("\"", "\\\""),
                    proposicaoCodigo == null ? -1 : proposicaoCodigo
                );
                emitter.send(SseEmitter.event()
                        .name("notificacao")
                        .data(json));
            } catch (IOException e) {
                emitters.remove(usuarioId);
            }
        }
    }
}