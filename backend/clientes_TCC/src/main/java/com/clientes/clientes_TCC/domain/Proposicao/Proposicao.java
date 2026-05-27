package com.clientes.clientes_TCC.domain.Proposicao;


import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "proposicao")
public class Proposicao {

    @Id
    private Long codigo;

    @ManyToOne
    @JoinColumn(name = "tipo_id", nullable = false)
    private TipoProposicao tipo;

    @ManyToOne
    @JoinColumn(name = "vereador_id", nullable = false)
    private Vereador vereador;

    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio;

    @Column(name = "data_efetivo", nullable = false)
    private LocalDateTime dataEfetivo;

    @ManyToOne
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoProposicao estado;

    @Column(nullable = false, length = 100)
    private String localizacao;

    @Column(name = "ultimo_tramite", nullable = false)
    private LocalDateTime ultimoTramite;

    @Column(nullable = false, length = 255)
    private String razao;

    @Column(name = "tramite_alternativo", nullable = false)
    private Boolean tramiteAlternativo;

    @Column(name = "encerrou_tramitacao", nullable = false)
    private Boolean encerrouTramitacao;

    @Column(name = "leis_similares", nullable = false, length = 255)
    private String leisSimilares;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String ementa;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String justificativa;

    @Column(nullable = false, length = 100)
    private String tag;

    @OneToMany(mappedBy = "proposicao", cascade = CascadeType.ALL)
    private List<Tramitacao> tramitacoes;
}
