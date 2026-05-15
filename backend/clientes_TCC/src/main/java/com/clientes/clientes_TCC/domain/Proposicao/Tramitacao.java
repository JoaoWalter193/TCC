package com.clientes.clientes_TCC.domain.Proposicao;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tramitacao")
public class Tramitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "cod_proposicao", nullable = false)
    private Proposicao proposicao;

    @Column(nullable = false, length = 255)
    private String origem;

    @Column(nullable = false, length = 100)
    private String destino;

    @Column(name = "razao_envio", nullable = false, length = 100)
    private String razaoEnvio;

    @Column(nullable = false, length = 100)
    private String remetente;
}
