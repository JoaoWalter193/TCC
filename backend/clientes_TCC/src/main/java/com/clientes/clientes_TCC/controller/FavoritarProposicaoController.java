package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.service.FavoritarProposicaoService;
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
@RequestMapping("/user/{usuarioId}/fav")
@Tag(name = "Favoritar Proposição", description = "Gerenciamento de proposições favoritadas por usuário")
public class FavoritarProposicaoController {

    @Autowired
    private FavoritarProposicaoService favoritarProposicaoService;

    @Operation(summary = "Listar proposições favoritadas", description = "Retorna todas as proposições que um usuário marcou como favoritas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de proposições favoritadas retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<ProposicaoListaResponseDTO>> listarProposicoesFavoritadas(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return favoritarProposicaoService.listarProposicoesFavoritadas(usuarioId);
    }

    @Operation(summary = "Favoritar proposição", description = "Marca uma proposição como favorita para o usuário informado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Proposição favoritada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Proposição já favoritada", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário ou proposição não encontrados", content = @Content)
    })
    @PostMapping("/{codigo}")
    public ResponseEntity<ResponseDTO> favoritarProposicao(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "Código da proposição", example = "12345", required = true)
            @PathVariable Long codigo) {
        return favoritarProposicaoService.favoritarProposicao(usuarioId, codigo);
    }

    @Operation(summary = "Desfavoritar proposição", description = "Remove uma proposição da lista de favoritas do usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Proposição desfavoritada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Proposição não estava favoritada", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário ou proposição não encontrados", content = @Content)
    })
    @DeleteMapping("/{codigo}")
    public ResponseEntity<ResponseDTO> desfavoritarProposicao(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "Código da proposição", example = "12345", required = true)
            @PathVariable Long codigo) {
        return favoritarProposicaoService.desfavoritarProposicao(usuarioId, codigo);
    }
}