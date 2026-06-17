package com.clientes.clientes_TCC.exceptions;

public class SenhaDiferenteException extends RuntimeException{
    public SenhaDiferenteException(){super("As senhas precisam ser iguais");}
}
