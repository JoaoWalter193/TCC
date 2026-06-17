package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Notificacao.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {
    List<Notificacao> findByUsuarioIdOrderByCriadaEmDesc(Integer usuarioId);
    List<Notificacao> findByUsuarioIdAndLidaFalse(Integer usuarioId);
}