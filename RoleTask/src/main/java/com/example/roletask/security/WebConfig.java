package com.example.roletask.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                            "http://localhost:4200",    // ng serve port
                            "http://localhost:9090",    // docker-compose frontend
                            "http://localhost:8080",    // alternate docker port
                            "http://localhost"          // production
                        )
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}