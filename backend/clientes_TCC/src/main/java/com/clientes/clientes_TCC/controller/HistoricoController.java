package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.service.HistoricoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/historico")
public class HistoricoController {

    @Autowired
    private HistoricoService historicoService;

    @GetMapping
    public ResponseEntity<List<ProposicaoListaResponseDTO>> listarHistorico() {
        return historicoService.listarHistorico();
    }
}