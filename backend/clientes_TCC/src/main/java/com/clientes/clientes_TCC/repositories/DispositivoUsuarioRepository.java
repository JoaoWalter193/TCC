package com.clientes.clientes_TCC.repositories;

import com.clientes.clientes_TCC.domain.Notificacao.DispositivoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DispositivoUsuarioRepository extends JpaRepository<DispositivoUsuario, Integer> {

    @Query("SELECT d.fcmToken FROM DispositivoUsuario d WHERE d.usuarioId = :usuarioId")
    List<String> findTokensByUsuarioId(@Param("usuarioId") Integer usuarioId);

    boolean existsByUsuarioIdAndFcmToken(Integer usuarioId, String fcmToken);

    void deleteByFcmToken(String fcmToken);
}