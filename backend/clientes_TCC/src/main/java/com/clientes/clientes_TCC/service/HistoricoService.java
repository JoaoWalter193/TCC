package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Historico.HistoricoProposicao;
import com.clientes.clientes_TCC.domain.Historico.HistoricoResponseDTO;
import com.clientes.clientes_TCC.domain.Historico.HistoricoVereador;
import com.clientes.clientes_TCC.domain.Notificacao.Reacao;
import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.domain.Usuario.Usuario;
import com.clientes.clientes_TCC.domain.Vereador.Vereador;
import com.clientes.clientes_TCC.domain.Vereador.VereadorDTO;
import com.clientes.clientes_TCC.repositories.HistoricoProposicaoRepository;
import com.clientes.clientes_TCC.repositories.HistoricoVereadorRepository;
import com.clientes.clientes_TCC.repositories.ReacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HistoricoService {

    @Autowired
    private HistoricoProposicaoRepository historicoProposicaoRepository;

    @Autowired
    private HistoricoVereadorRepository historicoVereadorRepository;

    @Autowired
    private ReacaoRepository reacaoRepository;

    public void registrarVisualizacao(Long proposicaoCodigo) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        historicoProposicaoRepository.findAll().stream()
                .filter(h -> h.getUsuarioId().equals(usuario.getId())
                        && h.getProposicaoCodigo().equals(proposicaoCodigo))
                .forEach(h -> historicoProposicaoRepository.delete(h));

        HistoricoProposicao historico = new HistoricoProposicao();
        historico.setUsuarioId(usuario.getId());
        historico.setProposicaoCodigo(proposicaoCodigo);
        historicoProposicaoRepository.save(historico);
    }

    public void registrarVisualizacaoVereador(Integer vereadorId) {
        try {
            Usuario usuario = (Usuario) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();

            historicoVereadorRepository.findAll().stream()
                    .filter(h -> h.getUsuarioId().equals(usuario.getId())
                            && h.getVereadorId().equals(vereadorId))
                    .forEach(h -> historicoVereadorRepository.delete(h));

            HistoricoVereador historico = new HistoricoVereador();
            historico.setUsuarioId(usuario.getId());
            historico.setVereadorId(vereadorId);
            historicoVereadorRepository.save(historico);
        } catch (Exception e) {
            // Usuário não autenticado — não registra histórico
        }
    }

    public ResponseEntity<List<HistoricoResponseDTO>> listarHistorico() {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Integer usuarioId = usuario.getId();

        List<HistoricoProposicao> histProps = historicoProposicaoRepository
                .findByUsuarioIdOrderByVisualizadoEmDesc(usuarioId);
        List<HistoricoVereador> histVereadores = historicoVereadorRepository
                .findByUsuarioIdOrderByVisualizadoEmDesc(usuarioId);

        List<HistoricoResponseDTO> resultado = new ArrayList<>();

        if (!histProps.isEmpty()) {
            List<Long> codigos = histProps.stream()
                    .map(HistoricoProposicao::getProposicaoCodigo)
                    .toList();
            Map<Long, LocalDateTime> timestamps = histProps.stream()
                    .collect(Collectors.toMap(
                            HistoricoProposicao::getProposicaoCodigo,
                            HistoricoProposicao::getVisualizadoEm
                    ));

            Map<Long, String> reacoesMap = Collections.emptyMap();
            if (usuarioId != null) {
                List<Reacao> reacoes = reacaoRepository
                        .findByIdUsuarioIdAndIdProposicaoCodigoIn(usuarioId, codigos);
                reacoesMap = reacoes.stream()
                        .collect(Collectors.toMap(
                                r -> r.getId().getProposicaoCodigo(),
                                r -> r.getTipo().name()
                        ));
            }

            Map<Long, String> finalReacoesMap = reacoesMap;

            List<Proposicao> proposicoes = historicoProposicaoRepository
                    .findProposicoesByUsuarioId(usuarioId);
            for (Proposicao p : proposicoes) {
                LocalDateTime data = timestamps.get(p.getCodigo());
                if (data == null) continue;

                ProposicaoListaResponseDTO propDto = new ProposicaoListaResponseDTO(
                        p.getCodigo(),
                        p.getTipo().getTipo(),
                        p.getVereador().getId(),
                        p.getVereador().getNome(),
                        p.getDataEnvio(),
                        p.getEmenta(),
                        p.getTag(),
                        p.getEstado().getEstado(),
                        p.getLikes(),
                        p.getDislikes(),
                        finalReacoesMap.get(p.getCodigo())
                );
                resultado.add(HistoricoResponseDTO.deProposicao(p.getCodigo(), data, propDto));
            }
        }

        if (!histVereadores.isEmpty()) {
            List<Integer> vereadorIds = histVereadores.stream()
                    .map(HistoricoVereador::getVereadorId)
                    .toList();
            Map<Integer, LocalDateTime> timestamps = histVereadores.stream()
                    .collect(Collectors.toMap(
                            HistoricoVereador::getVereadorId,
                            HistoricoVereador::getVisualizadoEm
                    ));

            List<Vereador> vereadores = historicoVereadorRepository
                    .findVereadoresByUsuarioId(usuarioId);
            for (Vereador v : vereadores) {
                LocalDateTime data = timestamps.get(v.getId());
                if (data == null) continue;

                String siglaPartido = v.getPartido() != null
                        ? v.getPartido().getNomePartido() : "";
                VereadorDTO verDto = new VereadorDTO(
                        v.getId(), v.getNome(), siglaPartido,
                        v.getEmail(), v.getLegislaturas(), v.getGabinete(),
                        v.getTelefone(), v.getSite(), v.getAtivo(),
                        v.getGenero(), v.getNascimento(), v.getCor(),
                        v.getOcupacao(), v.getEscolaridade()
                );
                resultado.add(HistoricoResponseDTO.deVereador(v.getId(), data, verDto));
            }
        }

        resultado.sort((a, b) -> b.dataAcesso().compareTo(a.dataAcesso()));

        return ResponseEntity.ok(resultado);
    }
}
