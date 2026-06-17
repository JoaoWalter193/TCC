package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Proposicao.EstadoProposicao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoProposicaoRepository extends JpaRepository<EstadoProposicao, String> {
}
