package com.clientes.clientes_TCC.domain.Vereador;


import com.clientes.clientes_TCC.domain.Partido.Partido;
import com.clientes.clientes_TCC.domain.VereadorComissao.VereadorComissao;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Table(name="vereador")
@Entity(name="vereador")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Vereador {

    @Id
    private Integer id;

    private String nome;

    @ManyToOne
    @JoinColumn(name = "partido_id", referencedColumnName = "id")
    private Partido partido;

    private String email;
    private String legislaturas;
    private String gabinete;
    private String telefone;
    private String site;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "vereador_ativo")
    private VereadorAtivo ativo;

    private String genero;
    private Date nascimento;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "verador_cor")
    private VereadorCor cor;
    private String ocupacao;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "vereador_escolaridade")
    private VereadorEscolaridade escolaridade;

    @OneToMany(mappedBy = "vereador", cascade = CascadeType.ALL)
    private List<VereadorComissao> comissoes = new ArrayList<>();

}
