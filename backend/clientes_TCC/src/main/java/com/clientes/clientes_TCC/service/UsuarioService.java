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
            throw new UsuarioInexistenteException();
        }
        Usuario usuarioTemp = optionalUsuario.get();

        return ResponseEntity.ok(toDTO(usuarioTemp));
    }


    public ResponseEntity<ResponseDTO> criarUsuario(UsuarioCriarDTO data){
                Optional<Usuario> optionalUsuarioCpf = usuarioRepository.findByCpf(data.cpf());
                Optional<Usuario> optionalUsuarioEmail = usuarioRepository.findByEmail(data.email());

                if (optionalUsuarioCpf.isPresent() || optionalUsuarioEmail.isPresent()) {
                    throw new UsuarioExistenteException();

                } else if (!data.senha().equals(data.senhaNovamente())) {
                    throw new SenhaDiferenteException();

                } else {
                    String senhaHasheada = passwordEncoder.encode(data.senha());

                    Usuario usuarioTemp = new Usuario();
                    usuarioTemp.setCpf(data.cpf());
                    usuarioTemp.setNome(data.nome());
                    usuarioTemp.setEmail(data.email());
                    usuarioTemp.setSenha(senhaHasheada);
                    usuarioTemp.setAtivo(true);
                    usuarioTemp.setDataDelecao(null);
                    usuarioTemp.setCep(data.cep());
                    usuarioTemp.setEscolaridade(data.escolaridade());
                    usuarioTemp.setProfissao(data.profissao());

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
            throw new UsuarioInexistenteException();
        }

        if (usuarioOptional.isEmpty()) {
            throw new LoginInvalidoException();
        } else {

            Usuario usuarioTemp = usuarioOptional.get();
            if (!passwordEncoder.matches(data.senha(), usuarioTemp.getSenha())){
                throw new LoginInvalidoException();
            } else {

                String token = tokenService.generateToken(usuarioTemp);

                return ResponseEntity.ok(new LoginResponseDTO(
                        toDTO(usuarioTemp),
                        token));
            }

        }
    }

    public ResponseEntity<UsuarioDTO> atualizarUsuario (String cpf, UsuarioAtualizarDTO data){
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCpf(cpf);
        Optional<Usuario> usuarioOptionalEmailNovo = usuarioRepository.findByEmail(data.email());
        if (usuarioOptional.isEmpty()){
            throw new UsuarioInexistenteException();
        }

        Usuario usuarioTemp = usuarioOptional.get();
        if (!cpf.equals(usuarioTemp.getCpf())){
            throw new AtualizarOutroUsuarioException();
        }

        if (usuarioOptionalEmailNovo.isPresent() && !usuarioOptionalEmailNovo.get().getEmail().equals(usuarioTemp.getEmail())){
            throw new EmailJaUtilizadoException();
        }

        if (data.senhaAntiga() != null && data.senhaNova() != null && data.senhaNovaNovamente() != null) {
            if (!passwordEncoder.matches(data.senhaAntiga(), usuarioTemp.getSenha())){
                throw new SenhaAntigaErradaException();
            }

            if (!data.senhaNova().equals(data.senhaNovaNovamente())) {
                throw new SenhaDiferenteException();
            }
            String senhaNovaHasheada = passwordEncoder.encode(data.senhaNova());
            usuarioTemp.setSenha(senhaNovaHasheada);
        }

        usuarioTemp.setNome(data.nome());
        usuarioTemp.setEmail(data.email());
        if (data.cep() != null) usuarioTemp.setCep(data.cep());
        if (data.escolaridade() != null) usuarioTemp.setEscolaridade(data.escolaridade());
        if (data.profissao() != null) usuarioTemp.setProfissao(data.profissao());
        usuarioRepository.save(usuarioTemp);

        return ResponseEntity.ok(toDTO(usuarioTemp));
    }

    public ResponseEntity<ResponseDTO> deletarUsuario(String cpf){
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCpf(cpf);

        if (usuarioOptional.isEmpty()){
            throw new UsuarioInexistenteException();
        }

        Usuario usuarioTemp = usuarioOptional.get();
        usuarioTemp.setAtivo(false);
        usuarioTemp.setDataDelecao(Instant.now());

        usuarioRepository.save(usuarioTemp);

        return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Usuário deletado com sucesso!!"));
    }


    public ResponseEntity<ResponseDTO> recuperarContaSenha(String email) {

               Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);
               if (usuarioOptional.isEmpty()) {
                   throw new UsuarioInexistenteException();
               }

               if (usuarioRepository.existsByEmailAndAtivoTrue(email)) {

                   Usuario usuarioTemp = usuarioOptional.get();
                   String senhaAleatoria = RandomStringUtils.random(5, true, true);
                   String senhaHasheada = passwordEncoder.encode(senhaAleatoria);
                   usuarioTemp.setSenha(senhaHasheada);
                   usuarioRepository.save(usuarioTemp);


                   emailService.enviarSenhaRecuperar(usuarioTemp.getEmail(), usuarioTemp.getNome(), senhaAleatoria);

                   return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Senha Aleatória enviada no Email!"));

               } else {

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

    private UsuarioDTO toDTO(Usuario u) {
        return new UsuarioDTO(
                u.getCpf(),
                u.getNome(),
                u.getEmail(),
                u.getCep(),
                u.getEscolaridade(),
                u.getProfissao()
        );
    }
}
