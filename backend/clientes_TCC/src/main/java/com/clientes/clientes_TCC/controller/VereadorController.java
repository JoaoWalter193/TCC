package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;
import com.clientes.clientes_TCC.service.HistoricoService;
import com.clientes.clientes_TCC.service.VereadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/vereador")
@Tag(name = "Vereador", description = "Consulta de informações de vereadores da câmara municipal")
public class VereadorController {

    @Autowired
    VereadorService vereadorService;

    @Autowired
    HistoricoService historicoService;

    @Operation(summary = "Listar todos os vereadores", description = "Retorna uma lista com todos os vereadores cadastrados, incluindo dados como nome, partido, gabinete e contato")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de vereadores retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<VereadorDTO>> listarVereadores(){
        return vereadorService.listarVereadores();
    }

    @Operation(summary = "Buscar vereador por ID", description = "Retorna os dados detalhados de um vereador específico a partir do seu ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vereador encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Vereador não encontrado", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<VereadorDTO> buscarVereador(
            @Parameter(description = "ID do vereador", example = "1", required = true)
            @PathVariable Integer id){
        ResponseEntity<VereadorDTO> response = vereadorService.buscarVereador(id);
        if (response.getStatusCode().is2xxSuccessful()) {
            historicoService.registrarVisualizacaoVereador(id);
        }
        return response;
    }

}
