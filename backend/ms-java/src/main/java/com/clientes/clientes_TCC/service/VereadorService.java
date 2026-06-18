package com.clientes.clientes_TCC.service;


import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;
import com.clientes.clientes_TCC.exceptions.VereadorInexistenteException;
import com.clientes.clientes_TCC.repositories.UsuarioVereadorSeguindoRepository;
import com.clientes.clientes_TCC.repositories.VereadorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class VereadorService {

    private static final Logger log = LoggerFactory.getLogger(VereadorService.class);

    @Autowired
    VereadorRepository vereadorRepository;

    @Autowired
    UsuarioVereadorSeguindoRepository seguindoRepository;

    public ResponseEntity<List<VereadorDTO>> listarVereadores (){
        List<Vereador> vereadoresLista = vereadorRepository.findAllWithPartido();
        List<VereadorDTO> listaDTO = vereadoresLista.stream().map(v -> toDTO(v, 0)).toList();
        log.info("listarVereadores retornou {} vereadores", listaDTO.size());
        return ResponseEntity.ok(listaDTO);
    }

    public ResponseEntity<List<VereadorDTO>> buscarVereadores(String query) {
        List<Vereador> resultados = vereadorRepository.findByNomeContaining(query);
        Map<Integer, Integer> seguidoresMap = carregarSeguidoresMap(
                resultados.stream().map(Vereador::getId).toList()
        );
        List<VereadorDTO> listaDTO = resultados.stream()
                .map(v -> toDTO(v, seguidoresMap.getOrDefault(v.getId(), 0)))
                .limit(5)
                .toList();
        return ResponseEntity.ok(listaDTO);
    }

    public ResponseEntity<List<VereadorDTO>> listarVereadoresPorSeguidores() {
        List<Vereador> vereadoresLista = vereadorRepository.findAllWithPartido();

        Map<Integer, Integer> seguidoresMap = carregarSeguidoresMap(
                vereadoresLista.stream().map(Vereador::getId).toList()
        );
        log.info("listarVereadoresPorSeguidores: {} vereadores carregados", vereadoresLista.size());

        List<VereadorDTO> listaDTO = vereadoresLista.stream()
                .map(v -> toDTO(v, seguidoresMap.getOrDefault(v.getId(), 0)))
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
        VereadorDTO dto = toDTO(vereadorTemp, 0);

        return ResponseEntity.ok(dto);
    }

    private Map<Integer, Integer> carregarSeguidoresMap(List<Integer> ids) {
        if (ids.isEmpty()) return Collections.emptyMap();
        List<Object[]> counts = seguindoRepository.countByVereadorIds(ids);
        Map<Integer, Integer> map = new HashMap<>();
        for (Object[] row : counts) {
            map.put((Integer) row[0], ((Number) row[1]).intValue());
        }
        return map;
    }

    private VereadorDTO toDTO(Vereador v, Integer seguidores) {
        String siglaPartido = v.getPartido() != null ? v.getPartido().getNomePartido() : "";
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
