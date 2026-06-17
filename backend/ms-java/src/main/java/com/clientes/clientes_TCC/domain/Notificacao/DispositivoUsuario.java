package com.clientes.clientes_TCC.domain.Notificacao;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dispositivo_usuario")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DispositivoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "fcm_token", nullable = false)
    private String fcmToken;
}