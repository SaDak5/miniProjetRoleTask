package com.example.roletask.service;

import com.example.roletask.entities.HistoriqueAction;
import java.util.List;
import java.util.Optional;

public interface HistoriqueActionService {
    List<HistoriqueAction> toutesLesActions();
    Optional<HistoriqueAction> trouverParId(Long id);
    List<HistoriqueAction> trouverParUtilisateur(Long utilisateurId);
    HistoriqueAction enregistrer(HistoriqueAction action);
    void supprimer(Long id);
    // mthode utilitaire pour enregistrer depuis nimporte quel service
    void logAction(String action, String email);
}