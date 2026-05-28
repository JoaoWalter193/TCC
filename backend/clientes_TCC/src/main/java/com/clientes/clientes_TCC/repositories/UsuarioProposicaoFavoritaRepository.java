package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Notificacao.UsuarioProposicaoFavorita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UsuarioProposicaoFavoritaRepository extends JpaRepository<UsuarioProposicaoFavorita, UsuarioProposicaoFavorita.UsuarioProposicaoId> {

    @Query("SELECT f.id.usuarioId FROM UsuarioProposicaoFavorita f WHERE f.id.proposicaoCodigo = :codigo")
    List<Integer> findUsuarioIdsByProposicaoCodigo(@Param("codigo") Long codigo);

    boolean existsById(UsuarioProposicaoFavorita.UsuarioProposicaoId id);

    @Query("SELECT f.id.proposicaoCodigo FROM UsuarioProposicaoFavorita f WHERE f.id.usuarioId = :usuarioId")
    List<Long> findProposicaoCodigosByUsuarioId(@Param("usuarioId") Integer usuarioId);
}