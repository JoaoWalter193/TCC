package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Historico.HistoricoVereador;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface HistoricoVereadorRepository extends JpaRepository<HistoricoVereador, Integer> {

    @Query("""
        SELECT v FROM vereador v
        JOIN FETCH v.partido
        WHERE v.id IN (
            SELECT h.vereadorId FROM HistoricoVereador h
            WHERE h.usuarioId = :usuarioId
        )
    """)
    List<Vereador> findVereadoresByUsuarioId(@Param("usuarioId") Integer usuarioId);

    @Modifying
    @Transactional
    @Query("DELETE FROM HistoricoVereador h WHERE h.usuarioId = :usuarioId AND h.vereadorId = :vereadorId")
    void deleteByUsuarioIdAndVereadorId(@Param("usuarioId") Integer usuarioId, @Param("vereadorId") Integer vereadorId);

    List<HistoricoVereador> findByUsuarioIdOrderByVisualizadoEmDesc(Integer usuarioId);
}
