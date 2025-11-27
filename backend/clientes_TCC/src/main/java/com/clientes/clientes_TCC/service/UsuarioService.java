package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Default.LoginResponseDTO;
import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Usuario.*;
import com.clientes.clientes_TCC.exceptions.*;
import com.clientes.clientes_TCC.repositories.UsuarioRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    TokenService tokenService;

    @Autowired
    EmailService emailService;


    public ResponseEntity<UsuarioDTO> pegarUsuario(String cpf){
        Optional<Usuario> optionalUsuario = usuarioRepository.findByCpf(cpf);

        if (optionalUsuario.isEmpty()){
            //tratar que usuário não existe
            throw new UsuarioInexistenteException();
        }
        Usuario usuarioTemp = optionalUsuario.get();

        return ResponseEntity.ok(new UsuarioDTO(usuarioTemp.getCpf(), usuarioTemp.getNome(), usuarioTemp.getEmail()));
    }


    public ResponseEntity<ResponseDTO> criarUsuario(UsuarioCriarDTO data){
                // vai procurar por email e por cpf, para garantir que nenhum dos dois existam
                Optional<Usuario> optionalUsuarioCpf = usuarioRepository.findByCpf(data.cpf());
                Optional<Usuario> optionalUsuarioEmail = usuarioRepository.findByEmail(data.email());

                if (optionalUsuarioCpf.isPresent() || optionalUsuarioEmail.isPresent()) {
                    // tratar exceção de usuário já existente
                    throw new UsuarioExistenteException();

                } else if (!data.senha().equals(data.senhaNovamente())) {
                    // tratar exceção de senha diferente (front vai tratar mas aqui também é bom)
                    throw new SenhaDiferenteException();

                } else {
                    // lógica de criar a conta com senha Hasheada
                    String senhaHasheada = passwordEncoder.encode(data.senha());

                    Usuario usuarioTemp = new Usuario(data.cpf(),
                            data.nome(),
                            data.email(),
                            senhaHasheada,
                            true,
                            null);

                    usuarioRepository.save(usuarioTemp);
                    try {
                        emailService.enviarContaCriada(usuarioTemp.getEmail(), usuarioTemp.getNome());
                    } catch (Exception e) {
                        ;
                    }

                    return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDTO(HttpStatus.CREATED.toString(), "Usuário criado com sucesso!"));
                }
    }

    public ResponseEntity<LoginResponseDTO> logarUsuario(UsuarioLoginDTO data){
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(data.email());
        if (!usuarioRepository.existsByEmailAndAtivoTrue(data.email())){
            // tratar se usuário está ativo para realizar o login

            throw new UsuarioInexistenteException();
        }

        if (usuarioOptional.isEmpty()) {
            // tratar login inválido (email)
            throw new LoginInvalidoException();
        } else {

            Usuario usuarioTemp = usuarioOptional.get();
            if (!passwordEncoder.matches(data.senha(), usuarioTemp.getSenha())){
                // tratar login inválido (senha)
                throw new LoginInvalidoException();
            } else {

                String token = tokenService.generateToken(usuarioTemp);

                return ResponseEntity.ok(new LoginResponseDTO(
                        new UsuarioDTO (usuarioTemp.getCpf(),usuarioTemp.getNome(),usuarioTemp.getEmail()),
                        token));
            }

        }
    }

    public ResponseEntity<UsuarioDTO> atualizarUsuario (String cpf, UsuarioAtualizarDTO data){
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCpf(cpf);
        Optional<Usuario> usuarioOptionalEmailNovo = usuarioRepository.findByEmail(data.email());
        if (usuarioOptional.isEmpty()){
            // tratar não existe login
            throw new UsuarioInexistenteException();
        }

        Usuario usuarioTemp = usuarioOptional.get();
        if (!cpf.equals(usuarioTemp.getCpf())){
            // tratar ñ pode atualizar outra pessoa
            throw new AtualizarOutroUsuarioException();
        }

        if (usuarioOptionalEmailNovo.isPresent() && !usuarioOptionalEmailNovo.get().getEmail().equals(usuarioTemp.getEmail())){
            // tratar que não pode ter mais de uma conta com email
            throw new EmailJaUtilizadoException();
        }

        if (!passwordEncoder.matches(data.senhaAntiga(), usuarioTemp.getSenha())){
            throw new SenhaAntigaErradaException();
        }

        if (!data.senhaNova().equals(data.senhaNovaNovamente())) {
            // tratar senha para atualizar diferente
            throw new SenhaDiferenteException();
        }
        String senhaNovaHasheada = passwordEncoder.encode(data.senhaNova());

        // lógica de atualizar
        usuarioTemp.setNome(data.nome());
        usuarioTemp.setEmail(data.email());
        usuarioTemp.setSenha(senhaNovaHasheada);
        usuarioRepository.save(usuarioTemp);

        return ResponseEntity.ok(new UsuarioDTO(cpf, data.nome(),data.email()));
    }

    public ResponseEntity<ResponseDTO> deletarUsuario(String cpf){
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCpf(cpf);

        if (usuarioOptional.isEmpty()){
            // tratar não existe login
            throw new UsuarioInexistenteException();
        }

        Usuario usuarioTemp = usuarioOptional.get();
        usuarioTemp.setAtivo(false);
        usuarioTemp.setDataDelecao(Instant.now());


        usuarioRepository.save(usuarioTemp);

        return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Usuário deletado com sucesso!!"));
    }


    public ResponseEntity<ResponseDTO> recuperarContaSenha(String email) {
       // se o usuário estiver ativo -> Recuperar senha
       // se o usuário estiver destaivado e até 7 dias do request -> Recuperar conta


               Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);
               if (usuarioOptional.isEmpty()) {
                   //tratar usuário não existente
                   throw new UsuarioInexistenteException();
               }

               if (usuarioRepository.existsByEmailAndAtivoTrue(email)) {
                   // lógica para quando o usuário está ativo -> Recuperar senha

                   Usuario usuarioTemp = usuarioOptional.get();
                   String senhaAleatoria = RandomStringUtils.random(5, true, true);
                   String senhaHasheada = passwordEncoder.encode(senhaAleatoria);
                   usuarioTemp.setSenha(senhaHasheada);
                   usuarioRepository.save(usuarioTemp);


                   emailService.enviarSenhaRecuperar(usuarioTemp.getEmail(), usuarioTemp.getNome(), senhaAleatoria);

                   return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Senha Aleatória enviada no Email!"));

               } else {
                   // lógica para quando o usuário está desativado -> Recuperar conta

                   Usuario usuarioTemp = usuarioOptional.get();

                   Instant dataSolicitacao = Instant.now();
                   Instant dataExclusao = usuarioTemp.getDataDelecao();
                   Duration diferenca = Duration.between(dataExclusao, dataSolicitacao);
                   long diasDiferenca = diferenca.toDays();

                   if (diasDiferenca >= 7) {
                       throw new TempoRecuperarException();
                   } else {

                       usuarioTemp.setAtivo(true);
                       usuarioTemp.setDataDelecao(null);
                       usuarioRepository.save(usuarioTemp);

                       emailService.enviarContaRecuperar(usuarioTemp.getEmail(), usuarioTemp.getNome());
                       return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Conta Recuperada!"));
                   }


               }
    }
}
