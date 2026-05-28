package com.clientes.clientes_TCC.domain.Notificacao;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario_vereador_seguindo")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioVereadorSeguindo {

    @EmbeddedId
    private UsuarioVereadorId id;

    @Embeddable
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UsuarioVereadorId implements java.io.Serializable {
        @Column(name = "usuario_id")
        private Integer usuarioId;

        @Column(name = "vereador_id")
        private Integer vereadorId;
    }
}