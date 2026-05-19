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

@RestController
@RequestMapping("/prop")
public class ProposicaoController {


    @Autowired
    private ProposicaoService proposicaoService;


    @GetMapping
    public ResponseEntity<Page<ProposicaoListaResponseDTO>> listarProposicoes(
            @RequestParam(required = false) String tag,
            @ParameterObject
            @PageableDefault(size = 10, sort = "ultimoTramite", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return proposicaoService.listarProposicoes(tag,pageable);
    }
    @GetMapping("/{codigo}")
    public ResponseEntity<ProposicaoEspecificaDTO> buscarProposicao(
            @PathVariable Long codigo) {
        return proposicaoService.buscarProposicao(codigo);
    }

}
