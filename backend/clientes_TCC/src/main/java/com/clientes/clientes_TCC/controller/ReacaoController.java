package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.ReacaoResponseDTO;
import com.clientes.clientes_TCC.service.ReacaoService;
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
@RequestMapping("/user/{usuarioId}/reacao")
@Tag(name = "Reação", description = "Gerenciamento de reações (like/dislike) em proposições")
public class ReacaoController {

    @Autowired
    private ReacaoService reacaoService;

    @Operation(summary = "Listar reações do usuário", description = "Retorna todas as reações do usuário em proposições")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de reações retornada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<ReacaoResponseDTO>> listarReacoes(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId) {
        return reacaoService.listarReacoes(usuarioId);
    }

    @Operation(summary = "Buscar reação em proposição específica", description = "Retorna a reação do usuário em uma proposição específica")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reação encontrada"),
            @ApiResponse(responseCode = "404", description = "Reação não encontrada", content = @Content)
    })
    @GetMapping("/{codigo}")
    public ResponseEntity<ReacaoResponseDTO> buscarReacao(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "Código da proposição", example = "12345", required = true)
            @PathVariable Long codigo) {
        return reacaoService.buscarReacao(usuarioId, codigo);
    }

    @Operation(summary = "Criar/alterar/remover reação", description = """
            Cria, altera ou remove uma reação em uma proposição.
            - Se não existe reação: cria
            - Se existe com o mesmo tipo: remove (toggle)
            - Se existe com tipo diferente: altera""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reação alterada ou removida com sucesso"),
            @ApiResponse(responseCode = "201", description = "Reação criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Tipo inválido", content = @Content),
            @ApiResponse(responseCode = "404", description = "Proposição não encontrada", content = @Content)
    })
    @PostMapping("/{codigo}")
    public ResponseEntity<ResponseDTO> reagir(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "Código da proposição", example = "12345", required = true)
            @PathVariable Long codigo,
            @Parameter(description = "Tipo da reação (LIKE ou DISLIKE)", example = "LIKE", required = true)
            @RequestParam String tipo) {
        return reacaoService.reagir(usuarioId, codigo, tipo);
    }

    @Operation(summary = "Remover reação", description = "Remove a reação do usuário em uma proposição")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reação removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Reação não encontrada", content = @Content)
    })
    @DeleteMapping("/{codigo}")
    public ResponseEntity<ResponseDTO> removerReacao(
            @Parameter(description = "ID do usuário", example = "1", required = true)
            @PathVariable Integer usuarioId,
            @Parameter(description = "Código da proposição", example = "12345", required = true)
            @PathVariable Long codigo) {
        return reacaoService.removerReacao(usuarioId, codigo);
    }
}
