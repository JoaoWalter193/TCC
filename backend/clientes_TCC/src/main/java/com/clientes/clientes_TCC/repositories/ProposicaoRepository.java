package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


public interface ProposicaoRepository extends JpaRepository<Proposicao, Long> {

    //tag ignorando maiusculas/minusculas
    Page<Proposicao> findByTagContainingIgnoreCase(String tag, Pageable pageable);

    //tag exata
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
}
