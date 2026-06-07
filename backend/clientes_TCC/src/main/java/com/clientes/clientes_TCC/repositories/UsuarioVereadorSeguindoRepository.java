package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Notificacao.UsuarioVereadorSeguindo;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UsuarioVereadorSeguindoRepository extends JpaRepository<UsuarioVereadorSeguindo, UsuarioVereadorSeguindo.UsuarioVereadorId> {

    @Query("SELECT s.id.usuarioId FROM UsuarioVereadorSeguindo s WHERE s.id.vereadorId = :vereadorId")
    List<Integer> findUsuarioIdsByVereadorId(@Param("vereadorId") Integer vereadorId);

    boolean existsById(UsuarioVereadorSeguindo.UsuarioVereadorId id);

    @Query("SELECT s.id.vereadorId FROM UsuarioVereadorSeguindo s WHERE s.id.usuarioId = :usuarioId")
    List<Integer> findVereadorIdsByUsuarioId(@Param("usuarioId") Integer usuarioId);

    @Query("""
    SELECT v FROM vereador v
    WHERE v.id IN (
        SELECT s.id.vereadorId FROM UsuarioVereadorSeguindo s
        WHERE s.id.usuarioId = :usuarioId
    )
""")
    List<Vereador> findVereadoresByUsuarioId(@Param("usuarioId") Integer usuarioId);

}