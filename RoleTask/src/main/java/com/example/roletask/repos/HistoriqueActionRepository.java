package com.example.roletask.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.roletask.entities.HistoriqueAction;

import java.util.List;

public interface HistoriqueActionRepository extends JpaRepository<HistoriqueAction, Long> {

    List<HistoriqueAction> findByUtilisateurId(Long utilisateurId);
}