package com.clientes.clientes_TCC.exceptions;

public class EmailJaUtilizadoException extends RuntimeException{
    public EmailJaUtilizadoException(){super("Email já está sendo utilizado");}
}
