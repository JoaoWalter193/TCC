package com.clientes.clientes_TCC.service;


import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;
import com.clientes.clientes_TCC.exceptions.VereadorInexistenteException;
import com.clientes.clientes_TCC.repositories.VereadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VereadorService {

    @Autowired
    VereadorRepository vereadorRepository;

    public ResponseEntity<List<VereadorDTO>> listarVereadores (){
        List<Vereador> vereadoresLista = vereadorRepository.findAllWithPartido();
        List<VereadorDTO> listaDTO = vereadoresLista.stream().map(this::transformarEmDTO).toList();
        return ResponseEntity.ok(listaDTO);

    };


    public ResponseEntity<VereadorDTO> buscarVereador(Integer id){
        Optional<Vereador> vereadorOpt = vereadorRepository.findById(id);

        if (vereadorOpt.isEmpty()){
            throw new VereadorInexistenteException();
        }
        Vereador vereadorTemp = vereadorOpt.get();
        VereadorDTO dto = transformarEmDTO(vereadorTemp);

        return ResponseEntity.ok(dto);

    };




    private VereadorDTO transformarEmDTO(Vereador v) {
        return new VereadorDTO(
                v.getId(), v.getNome(), v.getPartido(),
                v.getEmail(), v.getLegislaturas(), v.getGabinete(),
                v.getTelefone(), v.getSite(), v.getAtivo(),
                v.getGenero(), v.getNascimento(), v.getCor(),
                v.getOcupacao(), v.getEscolaridade()
        );
    }

}
