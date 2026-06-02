package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Historico.HistoricoProposicao;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.domain.Usuario.Usuario;
import com.clientes.clientes_TCC.repositories.HistoricoProposicaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoricoService {

    @Autowired
    private HistoricoProposicaoRepository historicoRepository;

    public void registrarVisualizacao(Long proposicaoCodigo) {
        // pega o usuário autenticado direto do token JWT
        Usuario usuario = (Usuario) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        // evita duplicar — remove entrada anterior da mesma proposição
        // para que ela apareça no topo quando acessada novamente
        historicoRepository.findAll().stream()
                .filter(h -> h.getUsuarioId().equals(usuario.getId())
                        && h.getProposicaoCodigo().equals(proposicaoCodigo))
                .forEach(h -> historicoRepository.delete(h));

        HistoricoProposicao historico = new HistoricoProposicao();
        historico.setUsuarioId(usuario.getId());
        historico.setProposicaoCodigo(proposicaoCodigo);
        historicoRepository.save(historico);
    }

    public ResponseEntity<List<ProposicaoListaResponseDTO>> listarHistorico() {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<ProposicaoListaResponseDTO> resultado = historicoRepository
                .findProposicoesByUsuarioId(usuario.getId())
                .stream()
                .map(p -> new ProposicaoListaResponseDTO(
                        p.getCodigo(),
                        p.getTipo().getTipo(),
                        p.getVereador().getNome(),
                        p.getDataEnvio(),
                        p.getEmenta(),
                        p.getTag(),
                        p.getEstado().getEstado()
                ))
                .toList();

        return ResponseEntity.ok(resultado);
    }
}