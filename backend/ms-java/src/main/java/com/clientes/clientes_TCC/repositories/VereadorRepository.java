package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VereadorRepository extends JpaRepository<Vereador, Integer> {

    @Query("SELECT v FROM vereador v JOIN FETCH v.partido")
    List<Vereador> findAllWithPartido();

    @Query("SELECT v FROM vereador v JOIN FETCH v.partido WHERE LOWER(v.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Vereador> findByNomeContaining(@Param("nome") String nome);

}
