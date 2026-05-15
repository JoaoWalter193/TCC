package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Proposicao.TipoProposicao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoProposicaoRepository extends JpaRepository<TipoProposicao, String> {
}
