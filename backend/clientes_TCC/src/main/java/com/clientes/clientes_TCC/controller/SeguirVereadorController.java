package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.service.SeguirVereadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/{usuarioId}/follow")
public class SeguirVereadorController {

    @Autowired
    private SeguirVereadorService seguirVereadorService;

    @GetMapping
    public ResponseEntity<List<Integer>> listarVereadoresSeguidos(@PathVariable Integer usuarioId) {
        return seguirVereadorService.listarVereadoresSeguidos(usuarioId);
    }

    @PostMapping("/{vereadorId}")
    public ResponseEntity<ResponseDTO> seguirVereador(
            @PathVariable Integer usuarioId,
            @PathVariable Integer vereadorId) {
        return seguirVereadorService.seguirVereador(usuarioId, vereadorId);
    }

    @DeleteMapping("/{vereadorId}")
    public ResponseEntity<ResponseDTO> deixarDeSeguir(
            @PathVariable Integer usuarioId,
            @PathVariable Integer vereadorId) {
        return seguirVereadorService.deixarDeSeguirVereador(usuarioId, vereadorId);
    }
}