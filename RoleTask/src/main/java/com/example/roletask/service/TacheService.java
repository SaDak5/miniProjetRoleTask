package com.example.roletask.service;

import com.example.roletask.entities.Tache;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TacheService {

    Tache creer(Tache tache);

    Tache modifier(Long id, Tache tache);

    void supprimer(Long id);

    Optional<Tache> trouverParId(Long id);

    List<Tache> toutesLesTaches();

    // ✅ MODIFIÉ : Recherche par String (plus d'énumération)
    List<Tache> trouverParType(String typeTache);

    List<Tache> trouverParUtilisateur(Long utilisateurId);

    List<Tache> trouverParDate(LocalDate date);

    List<Tache> trouverEntreDeuxDates(LocalDate debut, LocalDate fin);
}