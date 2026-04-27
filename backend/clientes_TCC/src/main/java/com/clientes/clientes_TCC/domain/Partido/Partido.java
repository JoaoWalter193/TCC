package com.clientes.clientes_TCC.domain.Partido;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name="partido")
@Entity(name="partido")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor


public class Partido {

    @Id
    private Integer id;

    @Column(name="nomepartido")
    private String nomePartido;
}


