package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Notificacao.Reacao;
import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoEspecificaDTO;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.repositories.ProposicaoRepository;
import com.clientes.clientes_TCC.repositories.ReacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProposicaoService {


    @Autowired
    private ProposicaoRepository proposicaoRepository;

    @Autowired
    private HistoricoService historicoService;

    private ReacaoRepository reacaoRepository;

    public ResponseEntity<Page<ProposicaoListaResponseDTO>> listarProposicoes(String tag, Pageable pageable, Integer usuarioId) {
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
                p.getVereador().getNome(),
                p.getDataEnvio(),
                p.getEmenta(),
                p.getTag(),
                p.getEstado().getEstado(),
                p.getLikes(),
                p.getDislikes(),
                finalReacoesMap.get(p.getCodigo())
        )));
    }

    public ResponseEntity<ProposicaoEspecificaDTO> buscarProposicao(Long codigo, Integer usuarioId) {
        Optional<Proposicao> optProposicao = proposicaoRepository.findByCodigo(codigo);
        if (optProposicao.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
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

    @Value("${ms.dashboard.url:http://ms-dashboard:8085}")
    private String msDashboardUrl;

    @Autowired
    private RestTemplate restTemplate;

    public ResponseEntity<List<ProposicaoListaResponseDTO>> buscarPorSimilaridade(String query, int limit, Integer usuarioId) {
        String embeddingStr = gerarEmbedding(query);

        List<Proposicao> proposicoes = proposicaoRepository.findBySimilarity(embeddingStr, limit);

        Map<Long, String> reacoesMap = Collections.emptyMap();
        if (usuarioId != null && !proposicoes.isEmpty()) {
            List<Long> codigos = proposicoes.stream().map(Proposicao::getCodigo).toList();
            List<Reacao> reacoes = reacaoRepository.findByIdUsuarioIdAndIdProposicaoCodigoIn(usuarioId, codigos);
            reacoesMap = reacoes.stream()
                    .collect(Collectors.toMap(r -> r.getId().getProposicaoCodigo(), r -> r.getTipo().name()));
        }

        Map<Long, String> finalReacoesMap = reacoesMap;
        List<ProposicaoListaResponseDTO> resultado = proposicoes.stream()
                .map(p -> new ProposicaoListaResponseDTO(
                        p.getCodigo(),
                        p.getTipo().getTipo(),
                        p.getVereador().getNome(),
                        p.getDataEnvio(),
                        p.getEmenta(),
                        p.getTag(),
                        p.getEstado().getEstado(),
                        p.getLikes(),
                        p.getDislikes(),
                        finalReacoesMap.get(p.getCodigo())
                ))
                .toList();

        return ResponseEntity.ok(resultado);
    }

    private String gerarEmbedding(String texto) {
        String url = msDashboardUrl + "/embedding";
        Map<String, String> body = Map.of("texto", texto);
        String[] embedding = restTemplate.postForObject(url, body, String[].class);
        return "[" + String.join(",", embedding) + "]";
    }



}
