package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.UsuarioVereadorSeguindo;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import com.clientes.clientes_TCC.domain.Vereador.VereadorSeguindoDTO;
import com.clientes.clientes_TCC.repositories.UsuarioVereadorSeguindoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeguirVereadorService {

    @Autowired
    private UsuarioVereadorSeguindoRepository seguindoRepository;

    public ResponseEntity<ResponseDTO> seguirVereador(Integer usuarioId, Integer vereadorId) {
        UsuarioVereadorSeguindo.UsuarioVereadorId id =
                new UsuarioVereadorSeguindo.UsuarioVereadorId(usuarioId, vereadorId);

        if (seguindoRepository.existsById(id)) {
            return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Vereador já seguido!"));
        }

        UsuarioVereadorSeguindo seguindo = new UsuarioVereadorSeguindo();
        seguindo.setId(id);
        seguindoRepository.save(seguindo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseDTO(HttpStatus.CREATED.toString(), "Vereador seguido com sucesso!"));
    }

    public ResponseEntity<ResponseDTO> deixarDeSeguirVereador(Integer usuarioId, Integer vereadorId) {
        UsuarioVereadorSeguindo.UsuarioVereadorId id =
                new UsuarioVereadorSeguindo.UsuarioVereadorId(usuarioId, vereadorId);

        if (!seguindoRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(HttpStatus.NOT_FOUND.toString(), "Vereador não seguido!"));
        }

        seguindoRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Deixou de seguir o vereador!"));
    }

    public ResponseEntity<List<VereadorSeguindoDTO>> listarVereadoresSeguidos(Integer usuarioId) {
        List<Vereador> vereadores = seguindoRepository.findVereadoresByUsuarioId(usuarioId);

        List<VereadorSeguindoDTO> resultado = vereadores.stream()
                .map(v -> new VereadorSeguindoDTO(
                        v.getId(),
                        v.getNome(),
                        v.getPartido().getNomePartido(),
                        v.getAtivo().name(),
                        v.getEmail(),
                        v.getSite()
                ))
                .toList();

        return ResponseEntity.ok(resultado);
    }
}