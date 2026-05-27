package com.clientes.clientes_TCC.domain.Usuario;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Table(name= "usuario")
@Entity(name = "usuario")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
//TEM QUE MUDAR O ID INICIAL QUE NN PODE SER O CPF, PODE NÃO MUDAR MAS NN PODE SER A PRIMARY KEY/ID
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

    private Instant dataDelecao;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
