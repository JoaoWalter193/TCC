package com.clientes.clientes_TCC.controller;


import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoEspecificaDTO;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.service.ProposicaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prop")
@Tag(name = "Proposições", description = "Consulta e busca de proposições legislativas")
public class ProposicaoController {


    @Autowired
    private ProposicaoService proposicaoService;


    @Operation(summary = "Listar proposições", description = "Retorna uma lista paginada de proposições, com filtro opcional por tag")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de proposições retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<Page<ProposicaoListaResponseDTO>> listarProposicoes(
            @Parameter(description = "Filtro por tag da proposição", example = "Educação")
            @RequestParam(required = false) String tag,
            @Parameter(description = "ID do usuário logado (para reações)", example = "1")
            @RequestParam(required = false) Integer usuarioId,
            @ParameterObject
            @PageableDefault(size = 10, sort = "ultimoTramite", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return proposicaoService.listarProposicoes(tag, pageable, usuarioId);
    }

    @GetMapping("/tipos")
    public ResponseEntity<List<String>> listarTipos() {
        return proposicaoService.listarTipos();
    }

    @Operation(summary = "Buscar proposição por ID", description = "Retorna os detalhes de uma proposição específica")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Proposição encontrada"),
            @ApiResponse(responseCode = "404", description = "Proposição não encontrada", content = @Content)
    })
    @GetMapping("/{codigo}")
    public ResponseEntity<ProposicaoEspecificaDTO> buscarProposicao(
            @Parameter(description = "Código da proposição", example = "12345", required = true)
            @PathVariable Long codigo,
            @Parameter(description = "ID do usuário logado (para reações)", example = "1")
            @RequestParam(required = false) Integer usuarioId) {
        return proposicaoService.buscarProposicao(codigo, usuarioId);
    }

    @Operation(summary = "Listar proposições por vereador", description = "Retorna todas as proposições de um vereador específico")
    @GetMapping("/vereador/{vereadorId}")
    public ResponseEntity<List<ProposicaoListaResponseDTO>> listarPorVereador(
            @PathVariable Integer vereadorId,
            @RequestParam(required = false) Integer usuarioId) {
        return proposicaoService.listarPorVereador(vereadorId, usuarioId);
    }

    @Operation(summary = "Buscar proposições por nome do vereador", description = "Retorna proposições cujo nome do vereador contenha o termo buscado")
    @GetMapping("/busca/vereador")
    public ResponseEntity<List<ProposicaoListaResponseDTO>> buscarPorNomeVereador(
            @RequestParam String q,
            @RequestParam(required = false) Integer usuarioId) {
        return proposicaoService.buscarPorNomeVereador(q, usuarioId);
    }

    @Operation(summary = "Buscar proposições por similaridade", description = "Retorna proposições semanticamente similares ao texto informado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de proposições similares retornada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetro de busca inválido", content = @Content)
    })
    @GetMapping("/busca")
    public ResponseEntity<List<ProposicaoListaResponseDTO>> buscarPorSimilaridade(
            @Parameter(description = "Texto para busca semântica", example = "educação infantil", required = true)
            @RequestParam String q,
            @Parameter(description = "Limite de resultados", example = "10")
            @RequestParam(defaultValue = "10") int limit,
            @Parameter(description = "ID do usuário logado (para reações)", example = "1")
            @RequestParam(required = false) Integer usuarioId) {
        return proposicaoService.buscarPorSimilaridade(q, limit, usuarioId);
    }

}
