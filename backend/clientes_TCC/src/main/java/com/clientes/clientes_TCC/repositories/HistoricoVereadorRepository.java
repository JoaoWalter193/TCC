package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Historico.HistoricoVereador;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HistoricoVereadorRepository extends JpaRepository<HistoricoVereador, Integer> {

    @Query("""
        SELECT v FROM vereador v
        WHERE v.id IN (
            SELECT h.vereadorId FROM HistoricoVereador h
            WHERE h.usuarioId = :usuarioId
        )
    """)
    List<Vereador> findVereadoresByUsuarioId(@Param("usuarioId") Integer usuarioId);

    List<HistoricoVereador> findByUsuarioIdOrderByVisualizadoEmDesc(Integer usuarioId);
}
