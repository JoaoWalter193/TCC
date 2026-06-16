package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface ProposicaoRepository extends JpaRepository<Proposicao, Long> {

    @Override
    @EntityGraph(attributePaths = {"tipo", "vereador", "estado"})
    Page<Proposicao> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"tipo", "vereador", "estado"})
    Page<Proposicao> findByTagContainingIgnoreCase(String tag, Pageable pageable);

    Page<Proposicao> findByTag(String tag, Pageable pageable);

    Optional<Proposicao> findByCodigo(Long codigo);


    // busca por similaridade usando pgVector
    @Query(value = """
        SELECT * FROM proposicao
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """, nativeQuery = true)
    List<Proposicao> findBySimilarity(@Param("embedding") String embedding,
                                      @Param("limit") int limit);

    @Modifying
    @Query("UPDATE Proposicao p SET p.likes = p.likes + :delta WHERE p.codigo = :codigo")
    void incrementarLikes(@Param("codigo") Long codigo, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Proposicao p SET p.dislikes = p.dislikes + :delta WHERE p.codigo = :codigo")
    void incrementarDislikes(@Param("codigo") Long codigo, @Param("delta") int delta);
}
