package com.clientes.clientes_TCC.exceptions;

public class UsuarioExistenteException extends RuntimeException{
    public UsuarioExistenteException(){super ("Email/Cpf já cadastrado");}
}
