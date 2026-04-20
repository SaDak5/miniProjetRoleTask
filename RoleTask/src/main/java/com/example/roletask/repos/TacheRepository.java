package com.example.roletask.repos;

import com.example.roletask.entities.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TacheRepository extends JpaRepository<Tache, Long> {
    
    // ✅ MODIFIÉ : Utilise String au lieu de TypeTache
    List<Tache> findByTypeTache(String typeTache);
    
    List<Tache> findByUtilisateurId(Long utilisateurId);
    
    List<Tache> findByDateTache(LocalDate date);
    
    List<Tache> findByDateTacheBetween(LocalDate debut, LocalDate fin);
}