package com.clientes.clientes_TCC.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {


    @Autowired
    private JavaMailSender mailSender;


    public void enviarSenhaRecuperar(String toEmail, String nome, String senha){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("curitibativa.noreply@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Senha Recuperada - CuritibAtiva");

        String emailContent = String.format(
                " Olá %s, \n\n" +
                        "Você solicitou a recuperação de sua senha, segue no email uma senha gerada de maneira aleatória que substituirá sua senha antiga.\n" +
                        "Recomendamos que troque esta nova senha para uma de seu desejo.\n\n" +
                        "SENHA ALEATÓRIA: %s\n\n"+
                    "Equipe CuritibAtiva, este e-mail foi mandado automaticamente, não responda.",nome, senha
        );

        message.setText(emailContent);
        mailSender.send(message);
    }

    public void enviarContaRecuperar(String toEmail, String nome) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("curitibativa.noreply@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Conta Recuperada - CuritibAtiva");

        String emailContent = String.format(
                "Olá %s\n\n" +
                        "Você solicitou a reativação de sua conta do CuritibAtiva!!, agora poderá realizar seu login novamente na plataforma.\n\n" +
                        "Equipe CuritibAtiva, este e-mail foi mandado automaticamente, não responda.", nome
        );
        message.setText(emailContent);
        mailSender.send(message);
    }

    public void enviarContaCriada(String toEmail, String nome){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("curitibativa.noreply@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Seja Bem Vindo - CuritibAtiva");

        String emailContent = String.format(
                "Olá %s\n\n" +
                        "Bem Vindo ao CuritibAtiva, o app perfeito para você acompanhar os projetos de Lei dos vereadores de Curitiba\n\n" +
                        "Equipe CuritibAtiva, este e-mail foi mandado automaticamente, não responda.",nome
        );

        message.setText(emailContent);
        mailSender.send(message);
    }
}
