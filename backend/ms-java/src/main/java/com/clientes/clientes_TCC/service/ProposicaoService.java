package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Notificacao.Reacao;
import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoEspecificaDTO;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.exceptions.ProposicaoInexistenteException;
import com.clientes.clientes_TCC.repositories.ProposicaoRepository;
import com.clientes.clientes_TCC.repositories.ReacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProposicaoService {

    private static final Logger log = LoggerFactory.getLogger(ProposicaoService.class);


    @Autowired
    private ProposicaoRepository proposicaoRepository;

    @Autowired
    private HistoricoService historicoService;

    @Autowired
    private ReacaoRepository reacaoRepository;

    public ResponseEntity<Page<ProposicaoListaResponseDTO>> listarProposicoes(String tag, Pageable pageable, Integer usuarioId) {
        log.info("listarProposicoes tag={} page={} size={} usuarioId={}", tag, pageable.getPageNumber(), pageable.getPageSize(), usuarioId);
        Page<Proposicao> proposicoes;

        if (tag != null && !tag.isEmpty()) {
            proposicoes = proposicaoRepository.findByTagContainingIgnoreCase(tag, pageable);
        } else {
            proposicoes = proposicaoRepository.findAll(pageable);
        }

        Map<Long, String> reacoesMap = Collections.emptyMap();
        if (usuarioId != null) {
            List<Long> codigos = proposicoes.getContent().stream()
                    .map(Proposicao::getCodigo)
                    .toList();
            if (!codigos.isEmpty()) {
                List<Reacao> reacoes = reacaoRepository.findByIdUsuarioIdAndIdProposicaoCodigoIn(usuarioId, codigos);
                reacoesMap = reacoes.stream()
                        .collect(Collectors.toMap(r -> r.getId().getProposicaoCodigo(), r -> r.getTipo().name()));
            }
        }

        Map<Long, String> finalReacoesMap = reacoesMap;
        return ResponseEntity.ok(proposicoes.map(p -> new ProposicaoListaResponseDTO(
                p.getCodigo(),
                p.getTipo().getTipo(),
                p.getVereador().getId(),
                p.getVereador().getNome(),
                p.getDataEnvio(),
                p.getRazao(),
                p.getEmenta(),
                p.getTag(),
                p.getEstado().getEstado(),
                p.getLikes(),
                p.getDislikes(),
                finalReacoesMap.get(p.getCodigo())
        )));
    }

    public ResponseEntity<List<ProposicaoListaResponseDTO>> listarPorVereador(Integer vereadorId, Integer usuarioId) {
        log.info("listarPorVereador vereadorId={} usuarioId={}", vereadorId, usuarioId);
        List<Proposicao> proposicoes = proposicaoRepository.findByVereadorId(vereadorId);
        return ResponseEntity.ok(mapToResponseDTO(proposicoes, usuarioId));
    }

    public ResponseEntity<ProposicaoEspecificaDTO> buscarProposicao(Long codigo, Integer usuarioId) {
        log.info("buscarProposicao codigo={} usuarioId={}", codigo, usuarioId);
        Optional<Proposicao> optProposicao = proposicaoRepository.findByCodigo(codigo);
        if (optProposicao.isEmpty()){
            throw new ProposicaoInexistenteException();
        }
        Proposicao proposicao = optProposicao.get();

        String currentUserReaction = null;
        if (usuarioId != null) {
            Optional<Reacao> reacao = reacaoRepository.findByIdUsuarioIdAndIdProposicaoCodigo(usuarioId, codigo);
            if (reacao.isPresent()) {
                currentUserReaction = reacao.get().getTipo().name();
            }
        }

        ProposicaoEspecificaDTO dto = new ProposicaoEspecificaDTO(
                proposicao.getCodigo(),
                proposicao.getTipo().getTipo(),
                proposicao.getVereador().getId(),
                proposicao.getVereador().getNome(),
                proposicao.getVereador().getPartido().getNomePartido(),
                proposicao.getDataEnvio(),
                proposicao.getDataEfetivo(),
                proposicao.getEstado().getEstado(),
                proposicao.getLocalizacao(),
                proposicao.getUltimoTramite(),
                proposicao.getRazao(),
                proposicao.getTramiteAlternativo(),
                proposicao.getEncerrouTramitacao(),
                proposicao.getLeisSimilares(),
                proposicao.getEmenta(),
                proposicao.getTexto(),
                proposicao.getJustificativa(),
                proposicao.getTag(),
                proposicao.getLikes(),
                proposicao.getDislikes(),
                currentUserReaction
        );

        historicoService.registrarVisualizacao(codigo);

        return ResponseEntity.ok(dto);

    }

    @Value("${ms.python.url:http://ms-python:8085}")
    private String msDashboardUrl;

    @Autowired
    private RestTemplate restTemplate;

    public ResponseEntity<List<ProposicaoListaResponseDTO>> buscarPorNomeVereador(String nome, Integer usuarioId) {
        log.info("buscarPorNomeVereador nome={} usuarioId={}", nome, usuarioId);
        List<Proposicao> proposicoes = proposicaoRepository.buscarPorNomeVereador(nome);
        List<ProposicaoListaResponseDTO> resultado = mapToResponseDTO(proposicoes, usuarioId);
        return ResponseEntity.ok(resultado);
    }

    public ResponseEntity<List<ProposicaoListaResponseDTO>> buscarPorSimilaridade(String query, int limit, Integer usuarioId) {
        List<Proposicao> porVereador = proposicaoRepository.buscarPorNomeVereador(query);

        String embeddingStr = gerarEmbedding(query);
        List<Proposicao> semanticas = proposicaoRepository.findBySimilarity(embeddingStr, limit);

        Set<Long> idsExistentes = porVereador.stream().map(Proposicao::getCodigo).collect(Collectors.toSet());
        for (Proposicao p : semanticas) {
            if (idsExistentes.add(p.getCodigo())) {
                porVereador.add(p);
            }
        }

        return ResponseEntity.ok(mapToResponseDTO(porVereador, usuarioId));
    }

    private List<ProposicaoListaResponseDTO> mapToResponseDTO(List<Proposicao> proposicoes, Integer usuarioId) {
        Map<Long, String> reacoesMap = Collections.emptyMap();
        if (usuarioId != null && !proposicoes.isEmpty()) {
            List<Long> codigos = proposicoes.stream().map(Proposicao::getCodigo).toList();
            List<Reacao> reacoes = reacaoRepository.findByIdUsuarioIdAndIdProposicaoCodigoIn(usuarioId, codigos);
            reacoesMap = reacoes.stream()
                    .collect(Collectors.toMap(r -> r.getId().getProposicaoCodigo(), r -> r.getTipo().name()));
        }

        Map<Long, String> finalReacoesMap = reacoesMap;
        return proposicoes.stream()
                .map(p -> new ProposicaoListaResponseDTO(
                        p.getCodigo(),
                        p.getTipo().getTipo(),
                        p.getVereador().getId(),
                        p.getVereador().getNome(),
                        p.getDataEnvio(),
                        p.getRazao(),
                        p.getEmenta(),
                        p.getTag(),
                        p.getEstado().getEstado(),
                        p.getLikes(),
                        p.getDislikes(),
                        finalReacoesMap.get(p.getCodigo())
                ))
                .toList();
    }

    private String gerarEmbedding(String texto) {
        String url = msDashboardUrl + "/embedding";
        Map<String, String> body = Map.of("texto", texto);
        String[] embedding = restTemplate.postForObject(url, body, String[].class);
        return "[" + String.join(",", embedding) + "]";
    }



}
