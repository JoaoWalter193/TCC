package com.clientes.clientes_TCC.domain.Notificacao;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Notificação enviada para o usuário")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID da notificação", example = "1")
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    @Schema(description = "ID do usuário destinatário", example = "1")
    private Integer usuarioId;

    @Column(nullable = false)
    @Schema(description = "Título da notificação", example = "Nova proposição cadastrada")
    private String titulo;

    @Column(nullable = false)
    @Schema(description = "Mensagem da notificação", example = "O vereador João Silva cadastrou uma nova proposição.")
    private String mensagem;

    @Column(nullable = false)
    @Schema(description = "Indica se a notificação já foi lida", example = "false")
    private Boolean lida = false;

    @Column(name = "criada_em")
    @Schema(description = "Data e hora de criação da notificação", example = "2024-03-15T10:30:00")
    private LocalDateTime criadaEm = LocalDateTime.now();

    @Column(name = "proposicao_codigo")
    @Schema(description = "Código da proposição relacionada (se houver)", example = "12345")
    private Long proposicaoCodigo;
}