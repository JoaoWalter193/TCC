package com.clientes.clientes_TCC.domain.Notificacao;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reacao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Reacao {

    @EmbeddedId
    private ReacaoId id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoReacao tipo;

    @Column(name = "criada_em")
    private LocalDateTime criadaEm;

    @Embeddable
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReacaoId implements java.io.Serializable {
        @Column(name = "usuario_id")
        private Integer usuarioId;

        @Column(name = "proposicao_codigo")
        private Long proposicaoCodigo;
    }
}
