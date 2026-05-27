package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Comissao.Comissao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComissaoRepository extends JpaRepository <Comissao, String> {
}
