package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VereadorRepository extends JpaRepository<Vereador, Integer> {

    @Query("SELECT v FROM vereador v JOIN FETCH v.partido")
    List<Vereador> findAllWithPartido();

}
