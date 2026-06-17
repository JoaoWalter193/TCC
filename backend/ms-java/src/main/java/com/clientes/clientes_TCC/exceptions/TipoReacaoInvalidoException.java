package com.clientes.clientes_TCC.exceptions;

public class TipoReacaoInvalidoException extends RuntimeException{
    public TipoReacaoInvalidoException(){super("Tipo de reação inválido. Use LIKE ou DISLIKE");}
}
