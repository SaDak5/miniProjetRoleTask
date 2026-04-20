package com.example.roletask.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.roletask.entities.Permission;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByNom(String nom);

    boolean existsByNom(String nom);
}