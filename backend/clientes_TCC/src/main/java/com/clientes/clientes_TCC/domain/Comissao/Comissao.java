package com.clientes.clientes_TCC.domain.Comissao;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private Integer id;

    private String nomeComissao;

}
