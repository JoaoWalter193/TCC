package com.clientes.clientes_TCC.controller;


import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoEspecificaDTO;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.service.ProposicaoService;
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
public class ProposicaoController {


    @Autowired
    private ProposicaoService proposicaoService;


    @GetMapping
    public ResponseEntity<Page<ProposicaoListaResponseDTO>> listarProposicoes(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Integer usuarioId,
            @ParameterObject
            @PageableDefault(size = 10, sort = "ultimoTramite", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return proposicaoService.listarProposicoes(tag, pageable, usuarioId);
    }
    @GetMapping("/{codigo}")
    public ResponseEntity<ProposicaoEspecificaDTO> buscarProposicao(
            @PathVariable Long codigo,
            @RequestParam(required = false) Integer usuarioId) {
        return proposicaoService.buscarProposicao(codigo, usuarioId);
    }

    @GetMapping("/busca")
    public ResponseEntity<List<ProposicaoListaResponseDTO>> buscarPorSimilaridade(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer usuarioId) {
        return proposicaoService.buscarPorSimilaridade(q, limit, usuarioId);
    }

}
