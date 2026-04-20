package com.example.roletask.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.roletask.entities.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNom(String nom);

    boolean existsByNom(String nom);
}