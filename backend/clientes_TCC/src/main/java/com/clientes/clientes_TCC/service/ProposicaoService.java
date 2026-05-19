package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Proposicao.Proposicao;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoEspecificaDTO;
import com.clientes.clientes_TCC.domain.Proposicao.ProposicaoListaResponseDTO;
import com.clientes.clientes_TCC.repositories.ProposicaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;

@Service
public class ProposicaoService {


    @Autowired
    private ProposicaoRepository proposicaoRepository;


    public ResponseEntity<Page<ProposicaoListaResponseDTO>> listarProposicoes(String tag, Pageable pageable) {
        Page<Proposicao> proposicoes;

        if (tag != null && !tag.isEmpty()) {
            proposicoes = proposicaoRepository.findByTagContainingIgnoreCase(tag, pageable);
        } else {

            proposicoes = proposicaoRepository.findAll(pageable);
        }



        return ResponseEntity.ok(proposicoes.map(p -> new ProposicaoListaResponseDTO(
                p.getCodigo(),
                p.getTipo().getTipo(),
                p.getVereador().getNome(),
                p.getDataEnvio(),
                p.getEmenta(),
                p.getTag(),
                p.getEstado().getEstado()
        ))
        );
    }

    public ResponseEntity<ProposicaoEspecificaDTO> buscarProposicao(Long codigo) {
        Optional<Proposicao> optProposicao = proposicaoRepository.findByCodigo(codigo);
        if (optProposicao.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Proposicao proposicao = optProposicao.get();
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
                proposicao.getTag()
        );

        return ResponseEntity.ok(dto);

    }
}
