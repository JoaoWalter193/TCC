package com.clientes.clientes_TCC.domain.Vereador;

import com.clientes.clientes_TCC.domain.Partido.Partido;

import java.util.Date;

public record VereadorDTO(
        Integer id,
        String nome,
        Partido partido,
        String email,
        String legislaturas,
        String gabinete,
        String telefone,
        String site,
        VereadorAtivo vereador_ativo,
        String genero,
        Date dataNasc,
        VereadorCor vereador_cor,
        String ocupacao,
        VereadorEscolaridade vereador_escolaridade
) {
}
