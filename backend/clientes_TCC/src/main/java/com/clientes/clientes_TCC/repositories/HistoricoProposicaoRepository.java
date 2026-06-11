package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Historico.HistoricoProposicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HistoricoProposicaoRepository extends JpaRepository<HistoricoProposicao, Integer> {

    @Query("""
        SELECT p FROM Proposicao p
        WHERE p.codigo IN (
            SELECT h.proposicaoCodigo FROM HistoricoProposicao h
            WHERE h.usuarioId = :usuarioId
        )
    """)
    List<com.clientes.clientes_TCC.domain.Proposicao.Proposicao> findProposicoesByUsuarioId(
            @Param("usuarioId") Integer usuarioId
    );

    List<HistoricoProposicao> findByUsuarioIdOrderByVisualizadoEmDesc(Integer usuarioId);
}