package com.clientes.clientes_TCC.domain.Partido;


import jakarta.persistence.*;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="nomepartido")
    private String nomePartido;
}


