package com.clientes.clientes_TCC.controller;

import com.clientes.clientes_TCC.domain.Default.ResponseDTO;
import com.clientes.clientes_TCC.domain.Notificacao.DispositivoRegistrarDTO;
import com.clientes.clientes_TCC.service.DispositivoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dispositivos")
public class DispositivoController {

    @Autowired
    private DispositivoService dispositivoService;

    @PostMapping
    public ResponseEntity<ResponseDTO> registrarToken(@RequestBody DispositivoRegistrarDTO data) {
        return dispositivoService.registrarToken(data);
    }

    @DeleteMapping("/{fcmToken}")
    public ResponseEntity<ResponseDTO> removerToken(@PathVariable String fcmToken) {
        return dispositivoService.removerToken(fcmToken);
    }
}