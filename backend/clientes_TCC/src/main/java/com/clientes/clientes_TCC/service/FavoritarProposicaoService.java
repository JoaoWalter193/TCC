package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.UsuarioProposicaoFavorita;
import com.clientes.clientes_TCC.repositories.UsuarioProposicaoFavoritaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoritarProposicaoService {

    @Autowired
    private UsuarioProposicaoFavoritaRepository favoritaRepository;

    public ResponseEntity<ResponseDTO> favoritarProposicao(Integer usuarioId, Long proposicaoCodigo) {
        UsuarioProposicaoFavorita.UsuarioProposicaoId id =
                new UsuarioProposicaoFavorita.UsuarioProposicaoId(usuarioId, proposicaoCodigo);

        if (favoritaRepository.existsById(id)) {
            return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Proposição já favoritada!"));
        }

        UsuarioProposicaoFavorita favorita = new UsuarioProposicaoFavorita();
        favorita.setId(id);
        favoritaRepository.save(favorita);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseDTO(HttpStatus.CREATED.toString(), "Proposição favoritada com sucesso!"));
    }

    public ResponseEntity<ResponseDTO> desfavoritarProposicao(Integer usuarioId, Long proposicaoCodigo) {
        UsuarioProposicaoFavorita.UsuarioProposicaoId id =
                new UsuarioProposicaoFavorita.UsuarioProposicaoId(usuarioId, proposicaoCodigo);

        if (!favoritaRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(HttpStatus.NOT_FOUND.toString(), "Proposição não favoritada!"));
        }

        favoritaRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Proposição desfavoritada com sucesso!"));
    }

    public ResponseEntity<List<Long>> listarProposicoesFavoritadas(Integer usuarioId) {
        return ResponseEntity.ok(favoritaRepository.findProposicaoCodigosByUsuarioId(usuarioId));
    }
}