package com.clientes.clientes_TCC.domain.Historico;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_proposicao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HistoricoProposicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "proposicao_codigo", nullable = false)
    private Long proposicaoCodigo;

    @Column(name = "visualizado_em")
    private LocalDateTime visualizadoEm = LocalDateTime.now();
}