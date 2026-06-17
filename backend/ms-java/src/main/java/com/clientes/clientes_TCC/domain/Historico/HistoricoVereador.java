package com.clientes.clientes_TCC.domain.Historico;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_vereador")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HistoricoVereador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "vereador_id", nullable = false)
    private Integer vereadorId;

    @Column(name = "visualizado_em")
    private LocalDateTime visualizadoEm = LocalDateTime.now();
}
