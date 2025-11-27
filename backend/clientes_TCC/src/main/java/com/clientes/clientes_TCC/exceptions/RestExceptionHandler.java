package com.clientes.clientes_TCC.exceptions;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.lang.annotation.Repeatable;
import java.net.http.HttpResponse;


@RestControllerAdvice
@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

//    EXCEÇÕES DE LOGIN

    @ExceptionHandler(LoginInvalidoException.class)
    private ResponseEntity<ResponseDTO> loginInvalidoException(LoginInvalidoException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseDTO(HttpStatus.NOT_FOUND.toString(), ex.getMessage())
        );
    }

    // EXCEÇÕES DE SENHA

    @ExceptionHandler(SenhaDiferenteException.class)
    private ResponseEntity<ResponseDTO> senhaDiferenteException(SenhaDiferenteException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ResponseDTO(HttpStatus.BAD_REQUEST.toString(), ex.getMessage())
        );
    }

    @ExceptionHandler(SenhaAntigaErradaException.class)
    private ResponseEntity<ResponseDTO> senhaAntigaErradaException(SenhaAntigaErradaException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ResponseDTO(HttpStatus.CONFLICT.toString(), ex.getMessage())
        );
    }


    // EXCEÇÕES DE USUÁRIO

    @ExceptionHandler(UsuarioExistenteException.class)
    private ResponseEntity<ResponseDTO> usuarioExistenteException(UsuarioExistenteException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ResponseDTO(HttpStatus.CONFLICT.toString(), ex.getMessage())
        );
    }

    @ExceptionHandler(UsuarioInexistenteException.class)
    private ResponseEntity<ResponseDTO> usuarioInexistenteException(UsuarioInexistenteException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseDTO(HttpStatus.NOT_FOUND.toString(), ex.getMessage())
        );
    }

    @ExceptionHandler(AtualizarOutroUsuarioException.class)
    private ResponseEntity<ResponseDTO> atualizarOutroUsuarioException(AtualizarOutroUsuarioException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ResponseDTO(HttpStatus.BAD_REQUEST.toString(), ex.getMessage())
        );
    }

    //EXCEÇÕES DE CONTA

    @ExceptionHandler(TempoRecuperarException.class)
    private ResponseEntity<ResponseDTO> tempoRecuperarException (TempoRecuperarException ex){
        return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(
                new ResponseDTO(HttpStatus.PRECONDITION_FAILED.toString(), ex.getMessage())
        );
    }

    @ExceptionHandler(EmailJaUtilizadoException.class)
    private ResponseEntity<ResponseDTO> emailJaUtilizadoException(EmailJaUtilizadoException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ResponseDTO(HttpStatus.CONFLICT.toString(), ex.getMessage())
        );
    }

    @ExceptionHandler(ErroInternoSistemaException.class)
    private ResponseEntity<ResponseDTO> erroInternoException(ErroInternoSistemaException ex){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.toString(), ex.getMessage())
        );
    }


}
