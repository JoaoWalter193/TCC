package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.repositories.UsuarioProposicaoFavoritaRepository;
import com.clientes.clientes_TCC.repositories.UsuarioVereadorSeguindoRepository;
import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import com.clientes.clientes_TCC.repositories.ProposicaoRepository;
import org.postgresql.PGConnection;
import org.postgresql.PGNotification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Service
public class ProposicaoListenerService {

    private static final Logger log = LoggerFactory.getLogger(ProposicaoListenerService.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Autowired
    private ProposicaoRepository proposicaoRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Autowired
    private UsuarioProposicaoFavoritaRepository favoritaRepository;

    @Autowired
    private UsuarioVereadorSeguindoRepository seguindoRepository;

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void escutarNotificacoes() {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            log.info("Listener PostgreSQL iniciado com conexão dedicada");

            Statement stmt = conn.createStatement();
            stmt.execute("LISTEN proposicao_nova");
            stmt.execute("LISTEN proposicao_atualizada");
            stmt.close();

            PGConnection pgConn = conn.unwrap(PGConnection.class);

            while (!Thread.currentThread().isInterrupted()) {

                PGNotification[] notifications =
                        pgConn.getNotifications(5000);

                if (notifications != null) {

                    for (PGNotification notification : notifications) {

                        Long codigo =
                                Long.parseLong(notification.getParameter());

                        if (notification.getName()
                                .equals("proposicao_nova")) {

                            processarProposicaoNova(codigo);

                        } else if (notification.getName()
                                .equals("proposicao_atualizada")) {

                            processarProposicaoAtualizada(codigo);
                        }
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void processarProposicaoNova(Long codigo) {
        Optional<Proposicao> opt = proposicaoRepository.findByCodigo(codigo);
        if (opt.isEmpty()) return;

        Proposicao proposicao = opt.get();
        Integer vereadorId = proposicao.getVereador().getId();

        // notifica quem segue o vereador
        List<Integer> seguidores = seguindoRepository.findUsuarioIdsByVereadorId(vereadorId);
        for (Integer usuarioId : seguidores) {
            notificacaoService.notificarUsuario(
                    usuarioId,
                    "Nova proposição de " + proposicao.getVereador().getNome(),
                    proposicao.getEmenta(),
                    codigo
            );
        }
    }

    private void processarProposicaoAtualizada(Long codigo) {
        Optional<Proposicao> opt = proposicaoRepository.findByCodigo(codigo);
        if (opt.isEmpty()) return;

        Proposicao proposicao = opt.get();

        // notifica quem favoritou a proposição
        List<Integer> favoritadores = favoritaRepository.findUsuarioIdsByProposicaoCodigo(codigo);
        for (Integer usuarioId : favoritadores) {
            notificacaoService.notificarUsuario(
                    usuarioId,
                    "Atualização em proposição favoritada",
                    proposicao.getEmenta() + " — " + proposicao.getEstado().getEstado(),
                    codigo
            );
        }
    }
}