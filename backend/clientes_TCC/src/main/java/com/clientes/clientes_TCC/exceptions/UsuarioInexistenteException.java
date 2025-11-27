package com.clientes.clientes_TCC.exceptions;

public class UsuarioInexistenteException extends RuntimeException{
    public UsuarioInexistenteException(){super ("Usuário Inexistente!! Caso tenha deletado sua conta recentemente. Recupere ela!");}
}