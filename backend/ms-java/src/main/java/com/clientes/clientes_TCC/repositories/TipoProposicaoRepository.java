package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Proposicao.TipoProposicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TipoProposicaoRepository extends JpaRepository<TipoProposicao, String> {
    @Query("SELECT t.tipo FROM TipoProposicao t ORDER BY t.tipo")
    List<String> findAllTipos();
}
