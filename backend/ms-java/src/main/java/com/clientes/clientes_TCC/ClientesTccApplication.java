package com.clientes.clientes_TCC;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClientesTccApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClientesTccApplication.class, args);
	}

}
