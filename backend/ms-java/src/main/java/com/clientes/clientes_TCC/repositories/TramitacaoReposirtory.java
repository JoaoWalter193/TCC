package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Proposicao.Tramitacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TramitacaoReposirtory extends JpaRepository <Tramitacao, String> {
}
