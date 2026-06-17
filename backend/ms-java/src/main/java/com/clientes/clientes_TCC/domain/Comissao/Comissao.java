package com.clientes.clientes_TCC.domain.Comissao;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name="comissao")
@Entity(name="comissao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Comissao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nomeComissao;

}
