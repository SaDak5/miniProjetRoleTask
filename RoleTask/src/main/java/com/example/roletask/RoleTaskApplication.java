package com.example.roletask;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EntityScan(basePackages = "com.example.roletask.entities")
@EnableJpaRepositories(basePackages = "com.example.roletask.repos")
@EnableAsync
public class RoleTaskApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(RoleTaskApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
      
        System.out.println("Application RoleTask démarrée avec succès !");
    }
}