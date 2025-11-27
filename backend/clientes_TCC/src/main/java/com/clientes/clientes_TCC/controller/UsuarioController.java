package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.LoginResponseDTO;
import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioAtualizarDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioCriarDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioLoginDTO;
import com.clientes.clientes_TCC.service.UsuarioService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @GetMapping("/{cpf}")
    public ResponseEntity<UsuarioDTO> pegarUsuario(
    @Parameter(
            description = "CPF do usuário a ser atualizado",
            example = "07762143432",
            required = true
    )@PathVariable String cpf){
        return usuarioService.pegarUsuario(cpf);
    }

    @PostMapping
    public ResponseEntity<ResponseDTO> criarUsuario(@RequestBody @Valid UsuarioCriarDTO data){
        return usuarioService.criarUsuario(data);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> loginUsuario(@RequestBody @Valid UsuarioLoginDTO data){
        return usuarioService.logarUsuario(data);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<UsuarioDTO> atualizarUsuario(@RequestBody @Valid UsuarioAtualizarDTO data,
    @Parameter(
            description = "CPF do usuário a ser atualizado",
            example = "07762143432",
            required = true
    )@PathVariable String cpf){
        return usuarioService.atualizarUsuario(cpf,data);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<ResponseDTO> deletarUsuario(
    @Parameter(
            description = "CPF do usuário a ser atualizado",
            example = "07762143432",
            required = true
    )@PathVariable String cpf){
        return usuarioService.deletarUsuario(cpf);
    }

    @PostMapping("/recover/{email}")
    public ResponseEntity<ResponseDTO> recuperarContaSenha(
    @Parameter(
            description = "CPF do usuário a ser atualizado",
            example = "07762143432",
            required = true
    )@PathVariable String email){
        return usuarioService.recuperarContaSenha(email);
    }

}
