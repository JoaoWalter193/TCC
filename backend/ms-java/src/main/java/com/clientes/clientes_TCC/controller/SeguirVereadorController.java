package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Vereador.VereadorSeguindoDTO;
import com.clientes.clientes_TCC.service.SeguirVereadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/{usuarioId}/follow")
@Tag(name = "Seguir Vereador", description = "Gerenciamento de vereadores seguidos por usuário")
public class SeguirVereadorController {

    @Autowired
    private SeguirVereadorService seguirVereadorService;

    @Operation(summary = "Listar vereadores seguidos", description = "Retorna todos os vereadores que um usuário está seguindo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de vereadores seguidos retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<VereadorSeguindoDTO>> listarVereadoresSeguidos(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return seguirVereadorService.listarVereadoresSeguidos(usuarioId);
    }

    @Operation(summary = "Verificar se segue vereador", description = "Retorna true se o usuário já segue o vereador, false caso contrário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status retornado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content)
    })
    @GetMapping("/{vereadorId}/status")
    public ResponseEntity<Boolean> verificarStatusSeguindo(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "ID do vereador", example = "1", required = true)
            @PathVariable Integer vereadorId) {
        return seguirVereadorService.verificarStatusSeguindo(usuarioId, vereadorId);
    }

    @Operation(summary = "Seguir vereador", description = "Adiciona um vereador à lista de seguidos do usuário para receber notificações sobre suas proposições")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vereador seguido com sucesso"),
            @ApiResponse(responseCode = "400", description = "Usuário já segue este vereador", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário ou vereador não encontrados", content = @Content)
    })
    @PostMapping("/{vereadorId}")
    public ResponseEntity<ResponseDTO> seguirVereador(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "ID do vereador", example = "1", required = true)
            @PathVariable Integer vereadorId) {
        return seguirVereadorService.seguirVereador(usuarioId, vereadorId);
    }

    @Operation(summary = "Deixar de seguir vereador", description = "Remove um vereador da lista de seguidos do usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vereador removido dos seguidos com sucesso"),
            @ApiResponse(responseCode = "400", description = "Usuário não segue este vereador", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário ou vereador não encontrados", content = @Content)
    })
    @DeleteMapping("/{vereadorId}")
    public ResponseEntity<ResponseDTO> deixarDeSeguir(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "ID do vereador", example = "1", required = true)
            @PathVariable Integer vereadorId) {
        return seguirVereadorService.deixarDeSeguirVereador(usuarioId, vereadorId);
    }
}