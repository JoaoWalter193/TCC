package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Notificacao.Notificacao;
import com.clientes.clientes_TCC.exceptions.NotificacaoInexistenteException;
import com.clientes.clientes_TCC.repositories.DispositivoUsuarioRepository;
import com.clientes.clientes_TCC.repositories.NotificacaoRepository;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacaoService {

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @Autowired
    private DispositivoUsuarioRepository dispositivoRepository;

    @Autowired
    private SseService sseService;

    // chamado pelo ProposicaoListenerService
    public void notificarUsuario(Integer usuarioId, String titulo, String mensagem, Long proposicaoCodigo) {
        Notificacao notif = new Notificacao();
        notif.setUsuarioId(usuarioId);
        notif.setTitulo(titulo);
        notif.setMensagem(mensagem);
        notif.setProposicaoCodigo(proposicaoCodigo);
        notificacaoRepository.save(notif);

        sseService.enviarNotificacao(usuarioId, titulo, mensagem, proposicaoCodigo);

        List<String> tokens = dispositivoRepository.findTokensByUsuarioId(usuarioId);
        for (String token : tokens) {
            enviarPushAndroid(token, titulo, mensagem);
        }
    }

    private void enviarPushAndroid(String fcmToken, String titulo, String mensagem) {
        try {
            Message message = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(titulo)
                            .setBody(mensagem)
                            .build())
                    .setAndroidConfig(AndroidConfig.builder()
                            .setPriority(AndroidConfig.Priority.HIGH)
                            .setTtl(86400)
                            .build())
                    .setToken(fcmToken)
                    .build();

            FirebaseMessaging.getInstance().send(message);
        } catch (Exception e) {
            System.err.println("Erro ao enviar push: " + e.getMessage());
        }
    }

    public Notificacao criarNotificacao(Integer usuarioId, String titulo, String mensagem, Long proposicaoCodigo) {
        Notificacao notif = new Notificacao();
        notif.setUsuarioId(usuarioId);
        notif.setTitulo(titulo);
        notif.setMensagem(mensagem);
        notif.setProposicaoCodigo(proposicaoCodigo);
        notificacaoRepository.save(notif);

        sseService.enviarNotificacao(usuarioId, titulo, mensagem, proposicaoCodigo);

        List<String> tokens = dispositivoRepository.findTokensByUsuarioId(usuarioId);
        for (String token : tokens) {
            enviarPushAndroid(token, titulo, mensagem);
        }

        return notif;
    }

    // chamados pelo NotificacaoController
    public ResponseEntity<List<Notificacao>> listarNotificacoes(Integer usuarioId) {
        return ResponseEntity.ok(
                notificacaoRepository.findByUsuarioIdOrderByCriadaEmDesc(usuarioId)
        );
    }

    public ResponseEntity<List<Notificacao>> listarNaoLidas(Integer usuarioId) {
        return ResponseEntity.ok(
                notificacaoRepository.findByUsuarioIdAndLidaFalse(usuarioId)
        );
    }

    public ResponseEntity<Void> marcarComoLida(Integer id) {
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(NotificacaoInexistenteException::new);
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<Void> marcarTodasComoLidas(Integer usuarioId) {
        List<Notificacao> naoLidas = notificacaoRepository.findByUsuarioIdAndLidaFalse(usuarioId);
        naoLidas.forEach(n -> n.setLida(true));
        notificacaoRepository.saveAll(naoLidas);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    public ResponseEntity<Void> excluirTodas(Integer usuarioId) {
        notificacaoRepository.deleteByUsuarioId(usuarioId);
        return ResponseEntity.noContent().build();
    }
}