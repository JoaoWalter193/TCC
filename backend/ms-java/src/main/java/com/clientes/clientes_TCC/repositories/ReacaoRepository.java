package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Notificacao.Reacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReacaoRepository extends JpaRepository<Reacao, Reacao.ReacaoId> {

    Optional<Reacao> findByIdUsuarioIdAndIdProposicaoCodigo(Integer usuarioId, Long proposicaoCodigo);

    List<Reacao> findByIdUsuarioId(Integer usuarioId);

    List<Reacao> findByIdUsuarioIdAndIdProposicaoCodigoIn(Integer usuarioId, Collection<Long> proposicaoCodigos);
}
