package com.clientes.clientes_TCC.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppCinfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}