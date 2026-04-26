package com.clientes.clientes_TCC.repositories;

import aj.org.objectweb.asm.commons.SerialVersionUIDAdder;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VereadorRepository extends JpaRepository<Vereador, String> {

    Optional<Vereador> findById(Integer id);

    @Query("SELECT v FROM vereador v JOIN FETCH v.partido")
    List<Vereador> findAllWithPartido();


}
