package com.clientes.clientes_TCC.domain.Notificacao;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario_proposicao_favorita")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioProposicaoFavorita {

    @EmbeddedId
    private UsuarioProposicaoId id;

    @Embeddable
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UsuarioProposicaoId implements java.io.Serializable {
        @Column(name = "usuario_id")
        private Integer usuarioId;

        @Column(name = "proposicao_codigo")
        private Long proposicaoCodigo;
    }
}