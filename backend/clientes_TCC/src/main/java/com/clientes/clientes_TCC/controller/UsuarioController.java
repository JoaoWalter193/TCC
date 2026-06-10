package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.LoginResponseDTO;
import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioAtualizarDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioCriarDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioDTO;
import com.clientes.clientes_TCC.domain.Usuario.UsuarioLoginDTO;
import com.clientes.clientes_TCC.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "Usuários", description = "Gerenciamento de contas de usuário")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @Operation(summary = "Buscar usuário por CPF", description = "Retorna os dados de um usuário específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping("/{cpf}")
    public ResponseEntity<UsuarioDTO> pegarUsuario(
    @Parameter(
            description = "CPF do usuário",
            example = "07762143432",
            required = true
    )@PathVariable String cpf){
        return usuarioService.pegarUsuario(cpf);
    }

    @Operation(summary = "Criar usuário", description = "Cria uma nova conta de usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "CPF ou email já cadastrado", content = @Content)
    })
    @PostMapping
    public ResponseEntity<ResponseDTO> criarUsuario(@RequestBody @Valid UsuarioCriarDTO data){
        return usuarioService.criarUsuario(data);
    }

    @Operation(summary = "Login", description = "Autentica o usuário e retorna token JWT com dados do usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> loginUsuario(@RequestBody @Valid UsuarioLoginDTO data){
        return usuarioService.logarUsuario(data);
    }

    @Operation(summary = "Atualizar usuário", description = "Atualiza os dados de um usuário existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @PutMapping("/{cpf}")
    public ResponseEntity<UsuarioDTO> atualizarUsuario(@RequestBody @Valid UsuarioAtualizarDTO data,
    @Parameter(
            description = "CPF do usuário",
            example = "07762143432",
            required = true
    )@PathVariable String cpf){
        return usuarioService.atualizarUsuario(cpf,data);
    }

    @Operation(summary = "Deletar usuário", description = "Remove (soft delete) um usuário pelo CPF")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @DeleteMapping("/{cpf}")
    public ResponseEntity<ResponseDTO> deletarUsuario(
    @Parameter(
            description = "CPF do usuário",
            example = "07762143432",
            required = true
    )@PathVariable String cpf){
        return usuarioService.deletarUsuario(cpf);
    }

    @Operation(summary = "Recuperar conta", description = "Envia email de recuperação de senha para o endereço informado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email de recuperação enviado"),
            @ApiResponse(responseCode = "404", description = "Email não encontrado", content = @Content)
    })
    @PostMapping("/recover/{email}")
    public ResponseEntity<ResponseDTO> recuperarContaSenha(
    @Parameter(
            description = "Email do usuário",
            example = "usuario@email.com",
            required = true
    )@PathVariable String email){
        return usuarioService.recuperarContaSenha(email);
    }

}
