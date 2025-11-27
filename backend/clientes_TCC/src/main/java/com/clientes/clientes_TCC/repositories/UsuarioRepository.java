package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    Optional<Usuario> findByCpf(String cpf);
    Optional<Usuario> findByEmail(String email);

    boolean existsByCpfAndAtivoTrue(String cpf);
    boolean existsByEmailAndAtivoTrue(String email);


}


