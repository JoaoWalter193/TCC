package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.service.FavoritarProposicaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/{usuarioId}/fav")
public class FavoritarProposicaoController {

    @Autowired
    private FavoritarProposicaoService favoritarProposicaoService;

    @GetMapping
    public ResponseEntity<List<Long>> listarProposicoesFavoritadas(@PathVariable Integer usuarioId) {
        return favoritarProposicaoService.listarProposicoesFavoritadas(usuarioId);
    }

    @PostMapping("/{codigo}")
    public ResponseEntity<ResponseDTO> favoritarProposicao(
            @PathVariable Integer usuarioId,
            @PathVariable Long codigo) {
        return favoritarProposicaoService.favoritarProposicao(usuarioId, codigo);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<ResponseDTO> desfavoritarProposicao(
            @PathVariable Integer usuarioId,
            @PathVariable Long codigo) {
        return favoritarProposicaoService.desfavoritarProposicao(usuarioId, codigo);
    }
}