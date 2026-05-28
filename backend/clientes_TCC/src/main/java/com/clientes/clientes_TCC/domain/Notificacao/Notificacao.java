package com.clientes.clientes_TCC.domain.Notificacao;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String mensagem;

    @Column(nullable = false)
    private Boolean lida = false;

    @Column(name = "criada_em")
    private LocalDateTime criadaEm = LocalDateTime.now();

    @Column(name = "proposicao_codigo")
    private Long proposicaoCodigo;
}