package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.UsuarioProposicaoFavorita;
import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.exceptions.ProposicaoNaoFavoritadaException;
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
            throw new ProposicaoNaoFavoritadaException();
        }

        favoritaRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Proposição desfavoritada com sucesso!"));
    }

    public ResponseEntity<List<ProposicaoListaResponseDTO>> listarProposicoesFavoritadas(Integer usuarioId) {
        List<Proposicao> proposicoes = favoritaRepository.findProposicoesByUsuarioId(usuarioId);

        List<ProposicaoListaResponseDTO> resultado = proposicoes.stream()
                .map(p -> new ProposicaoListaResponseDTO(
                        p.getCodigo(),
                        p.getTipo().getTipo(),
                        p.getVereador().getId(),
                        p.getVereador().getNome(),
                        p.getVereador().getAvatarUrl(),
                        p.getDataEnvio(),
                        p.getRazao(),
                        p.getEmenta(),
                        p.getTag(),
                        p.getEstado().getEstado(),
                        p.getLikes(),
                        p.getDislikes(),
                        null
                ))
                .toList();

        return ResponseEntity.ok(resultado);
    }
}