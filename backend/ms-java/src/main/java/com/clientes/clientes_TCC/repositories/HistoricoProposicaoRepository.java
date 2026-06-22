package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Historico.HistoricoProposicao;
import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface HistoricoProposicaoRepository extends JpaRepository<HistoricoProposicao, Integer> {

    @Query("""
        SELECT p FROM Proposicao p
        JOIN FETCH p.tipo
        JOIN FETCH p.vereador
        JOIN FETCH p.estado
        WHERE p.codigo IN (
            SELECT h.proposicaoCodigo FROM HistoricoProposicao h
            WHERE h.usuarioId = :usuarioId
        )
    """)
    List<Proposicao> findProposicoesByUsuarioId(@Param("usuarioId") Integer usuarioId);

    @Modifying
    @Transactional
    @Query("DELETE FROM HistoricoProposicao h WHERE h.usuarioId = :usuarioId AND h.proposicaoCodigo = :codigo")
    void deleteByUsuarioIdAndProposicaoCodigo(@Param("usuarioId") Integer usuarioId, @Param("codigo") Long codigo);

    @Modifying
    @Transactional
    @Query("DELETE FROM HistoricoProposicao h WHERE h.usuarioId = :usuarioId")
    void deleteByUsuarioId(@Param("usuarioId") Integer usuarioId);

    List<HistoricoProposicao> findByUsuarioIdOrderByVisualizadoEmDesc(Integer usuarioId);
}