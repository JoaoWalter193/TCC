package com.clientes.clientes_TCC.domain.Usuario;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Table(name= "usuario")
@Entity(name = "usuario")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 11)
    private String cpf;

    private String nome;

    private String email;

    private String senha;

    private Boolean ativo;

    @Column(name = "data_delecao", nullable = false)
    private Instant dataDelecao;

    @Column(length = 8)
    private String cep;

    @Column(length = 50)
    private String escolaridade;

    @Column(length = 100)
    private String profissao;

    @Column(length = 30)
    private String genero;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
