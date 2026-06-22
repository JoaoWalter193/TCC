package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Historico.HistoricoResponseDTO;
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
    public ResponseEntity<List<HistoricoResponseDTO>> listarHistorico() {
        return historicoService.listarHistorico();
    }

    @DeleteMapping("/{usuarioId}")
    public ResponseEntity<Void> excluirTudo(@PathVariable Integer usuarioId) {
        return historicoService.excluirTudo(usuarioId);
    }
}
