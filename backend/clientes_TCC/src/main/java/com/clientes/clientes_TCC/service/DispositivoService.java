package com.clientes.clientes_TCC.service;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.DispositivoUsuario;
import com.clientes.clientes_TCC.domain.Notificacao.DispositivoRegistrarDTO;
import com.clientes.clientes_TCC.repositories.DispositivoUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class DispositivoService {

    @Autowired
    private DispositivoUsuarioRepository dispositivoRepository;

    public ResponseEntity<ResponseDTO> registrarToken(DispositivoRegistrarDTO data) {
        // evita duplicar token para o mesmo usuário
        boolean jaExiste = dispositivoRepository
                .existsByUsuarioIdAndFcmToken(data.usuarioId(), data.fcmToken());

        if (jaExiste) {
            return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Token já registrado!"));
        }

        DispositivoUsuario dispositivo = new DispositivoUsuario();
        dispositivo.setUsuarioId(data.usuarioId());
        dispositivo.setFcmToken(data.fcmToken());
        dispositivoRepository.save(dispositivo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseDTO(HttpStatus.CREATED.toString(), "Token registrado com sucesso!"));
    }

    public ResponseEntity<ResponseDTO> removerToken(String fcmToken) {
        dispositivoRepository.deleteByFcmToken(fcmToken);
        return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.toString(), "Token removido com sucesso!"));
    }
}