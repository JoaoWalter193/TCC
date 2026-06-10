package com.clientes.clientes_TCC.domain.VereadorComissao;


import com.clientes.clientes_TCC.domain.Comissao.Comissao;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vereador_comissao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VereadorComissao {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "comissao_id", nullable = false)
    private Comissao comissao;

    @ManyToOne
    @JoinColumn(name = "vereador_id", nullable = false)
    private Vereador vereador;



}
