package com.example.roletask.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.roletask.entities.Utilisateur;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);
    
    List<Utilisateur> findByNom(String nom);
}