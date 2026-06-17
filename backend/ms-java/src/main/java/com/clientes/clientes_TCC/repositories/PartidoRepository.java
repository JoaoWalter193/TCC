package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Partido.Partido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartidoRepository extends JpaRepository<Partido, String> {
}
