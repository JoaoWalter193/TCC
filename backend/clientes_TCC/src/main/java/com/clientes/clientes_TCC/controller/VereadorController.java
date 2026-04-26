package com.clientes.clientes_TCC.controller;


import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;
import com.clientes.clientes_TCC.service.VereadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/vereador")
public class VereadorController {

    @Autowired
    VereadorService vereadorService;

    // NÃO TEMOS NADA PARA ADICONAR AQUI, SERÁ APENAS CONSULTA DE VEREADOR. VAI PUXAR UM VEREADOR ESPECÍFICO OU TODOS

    @GetMapping
    public ResponseEntity<List<VereadorDTO>> listarVereadores(){
        return vereadorService.listarVereadores();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VereadorDTO> buscarVereador(@PathVariable Integer id){
        return vereadorService.buscarVereador(id);
    };



}
