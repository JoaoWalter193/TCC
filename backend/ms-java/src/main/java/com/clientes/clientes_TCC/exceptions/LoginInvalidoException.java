package com.clientes.clientes_TCC.exceptions;

public class LoginInvalidoException extends RuntimeException{
    public LoginInvalidoException(){super("Email e/ou Senha Incorretos");}
}
