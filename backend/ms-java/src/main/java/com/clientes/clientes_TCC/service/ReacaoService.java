package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.Reacao;
import com.clientes.clientes_TCC.domain.Notificacao.ReacaoResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.TipoReacao;
import com.clientes.clientes_TCC.exceptions.ProposicaoInexistenteException;
import com.clientes.clientes_TCC.exceptions.ReacaoInexistenteException;
import com.clientes.clientes_TCC.exceptions.TipoReacaoInvalidoException;
import com.clientes.clientes_TCC.repositories.ProposicaoRepository;
import com.clientes.clientes_TCC.repositories.ReacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReacaoService {

    @Autowired
    private ReacaoRepository reacaoRepository;

    @Autowired
    private ProposicaoRepository proposicaoRepository;

    @Transactional
    public ResponseEntity<ResponseDTO> reagir(Integer usuarioId, Long proposicaoCodigo, String tipo) {
        if (!proposicaoRepository.existsById(proposicaoCodigo)) {
            throw new ProposicaoInexistenteException();
        }

        TipoReacao novoTipo;
        try {
            novoTipo = TipoReacao.valueOf(tipo.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new TipoReacaoInvalidoException();
        }

        Reacao.ReacaoId id = new Reacao.ReacaoId(usuarioId, proposicaoCodigo);
        Optional<Reacao> existente = reacaoRepository.findById(id);

        if (existente.isPresent()) {
            Reacao reacao = existente.get();
            TipoReacao tipoAtual = reacao.getTipo();

            if (tipoAtual == novoTipo) {
                reacaoRepository.delete(reacao);
                atualizarContador(proposicaoCodigo, tipoAtual, -1);
                return ResponseEntity.ok(new ResponseDTO("200", "Reação removida"));
            } else {
                reacao.setTipo(novoTipo);
                reacao.setCriadaEm(LocalDateTime.now());
                reacaoRepository.save(reacao);
                atualizarContador(proposicaoCodigo, tipoAtual, -1);
                atualizarContador(proposicaoCodigo, novoTipo, 1);
                return ResponseEntity.ok(new ResponseDTO("200", "Reação alterada para " + novoTipo));
            }
        } else {
            Reacao nova = new Reacao();
            nova.setId(id);
            nova.setTipo(novoTipo);
            nova.setCriadaEm(LocalDateTime.now());
            reacaoRepository.save(nova);
            atualizarContador(proposicaoCodigo, novoTipo, 1);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseDTO("201", "Reação criada com sucesso"));
        }
    }

    @Transactional
    public ResponseEntity<ResponseDTO> removerReacao(Integer usuarioId, Long proposicaoCodigo) {
        Reacao.ReacaoId id = new Reacao.ReacaoId(usuarioId, proposicaoCodigo);

        Optional<Reacao> reacao = reacaoRepository.findById(id);
        if (reacao.isEmpty()) {
            throw new ReacaoInexistenteException();
        }

        atualizarContador(proposicaoCodigo, reacao.get().getTipo(), -1);
        reacaoRepository.delete(reacao.get());
        return ResponseEntity.ok(new ResponseDTO("200", "Reação removida com sucesso"));
    }

    public ResponseEntity<List<ReacaoResponseDTO>> listarReacoes(Integer usuarioId) {
        List<Reacao> reacoes = reacaoRepository.findByIdUsuarioId(usuarioId);

        List<ReacaoResponseDTO> resultado = reacoes.stream()
                .map(r -> new ReacaoResponseDTO(
                        r.getId().getProposicaoCodigo(),
                        r.getTipo().name(),
                        r.getCriadaEm()
                ))
                .toList();

        return ResponseEntity.ok(resultado);
    }

    public ResponseEntity<ReacaoResponseDTO> buscarReacao(Integer usuarioId, Long proposicaoCodigo) {
        Optional<Reacao> reacao = reacaoRepository.findByIdUsuarioIdAndIdProposicaoCodigo(usuarioId, proposicaoCodigo);

        if (reacao.isEmpty()) {
            throw new ReacaoInexistenteException();
        }

        Reacao r = reacao.get();
        return ResponseEntity.ok(new ReacaoResponseDTO(
                r.getId().getProposicaoCodigo(),
                r.getTipo().name(),
                r.getCriadaEm()
        ));
    }

    private void atualizarContador(Long proposicaoCodigo, TipoReacao tipo, int delta) {
        if (tipo == TipoReacao.LIKE) {
            proposicaoRepository.incrementarLikes(proposicaoCodigo, delta);
        } else {
            proposicaoRepository.incrementarDislikes(proposicaoCodigo, delta);
        }
    }
}
