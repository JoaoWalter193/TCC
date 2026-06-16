package com.clientes.clientes_TCC.service;


import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;
import com.clientes.clientes_TCC.exceptions.VereadorInexistenteException;
import com.clientes.clientes_TCC.repositories.UsuarioVereadorSeguindoRepository;
import com.clientes.clientes_TCC.repositories.VereadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class VereadorService {

    @Autowired
    VereadorRepository vereadorRepository;

    @Autowired
    UsuarioVereadorSeguindoRepository seguindoRepository;

    public ResponseEntity<List<VereadorDTO>> listarVereadores (){
        List<Vereador> vereadoresLista = vereadorRepository.findAllWithPartido();
        List<VereadorDTO> listaDTO = vereadoresLista.stream().map(v -> transformarEmDTO(v, false)).toList();
        return ResponseEntity.ok(listaDTO);

    };

    public ResponseEntity<List<VereadorDTO>> listarVereadoresPorSeguidores() {
        List<Vereador> vereadoresLista = vereadorRepository.findAllWithPartido();
        List<VereadorDTO> listaDTO = vereadoresLista.stream()
                .map(v -> transformarEmDTO(v, true))
                .sorted(Comparator.comparingInt(VereadorDTO::seguidores).reversed()
                        .thenComparing(v -> v.nome() != null ? v.nome() : ""))
                .toList();
        return ResponseEntity.ok(listaDTO);
    }


    public ResponseEntity<VereadorDTO> buscarVereador(Integer id){
        Optional<Vereador> vereadorOpt = vereadorRepository.findById(id);

        if (vereadorOpt.isEmpty()){
            throw new VereadorInexistenteException();
        }
        Vereador vereadorTemp = vereadorOpt.get();
        VereadorDTO dto = transformarEmDTO(vereadorTemp, false);

        return ResponseEntity.ok(dto);

    };




    private VereadorDTO transformarEmDTO(Vereador v, boolean incluirSeguidores) {
        String siglaPartido = v.getPartido() != null ? v.getPartido().getNomePartido() : "";
        Integer seguidores = incluirSeguidores
                ? seguindoRepository.findUsuarioIdsByVereadorId(v.getId()).size()
                : 0;
        return new VereadorDTO(
                v.getId(), v.getNome(), siglaPartido,
                v.getEmail(), v.getLegislaturas(), v.getGabinete(),
                v.getTelefone(), v.getSite(), v.getAtivo(),
                v.getGenero(), v.getNascimento(), v.getCor(),
                v.getOcupacao(), v.getEscolaridade(),
                seguidores
        );
    }

}
