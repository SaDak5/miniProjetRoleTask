package com.example.roletask.service;

import com.example.roletask.entities.Tache;
import com.example.roletask.entities.Utilisateur;
import com.example.roletask.repos.TacheRepository;
import com.example.roletask.repos.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TacheServiceImpl implements TacheService {

    private final TacheRepository tacheRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HistoriqueActionService historiqueActionService;

    private String getEmailConnecte() {
        return SecurityContextHolder.getContext()
            .getAuthentication().getName();
    }

    @Override
    @Transactional
    public Tache creer(Tache tache) {
        if (tache.getUtilisateur() != null && tache.getUtilisateur().getId() != null) {
            Utilisateur utilisateur = utilisateurRepository
                .findById(tache.getUtilisateur().getId())
                .orElseThrow(() -> new RuntimeException(
                    "Utilisateur non trouvé : " + tache.getUtilisateur().getId()));
            tache.setUtilisateur(utilisateur);
        }
        Tache saved = tacheRepository.save(tache);
        historiqueActionService.logAction(
            "Création de la tâche : " + saved.getNomDuTache(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public Tache modifier(Long id, Tache tache) {
        Tache existante = tacheRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée : " + id));

        existante.setNomDuTache(tache.getNomDuTache());
        existante.setTypeTache(tache.getTypeTache());
        existante.setDateTache(tache.getDateTache());
        existante.setPeriodeTache(tache.getPeriodeTache());

        // ✅ On ne modifie pas l'utilisateur assigné (optionnel)
        // if (tache.getUtilisateur() != null && tache.getUtilisateur().getId() != null) {
        //     Utilisateur utilisateur = utilisateurRepository
        //         .findById(tache.getUtilisateur().getId())
        //         .orElseThrow(() -> new RuntimeException(
        //             "Utilisateur non trouvé : " + tache.getUtilisateur().getId()));
        //     existante.setUtilisateur(utilisateur);
        // }

        Tache saved = tacheRepository.save(existante);
        historiqueActionService.logAction(
            "Modification de la tâche : " + saved.getNomDuTache(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public void supprimer(Long id) {
        Tache tache = tacheRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée : " + id));
        String nom = tache.getNomDuTache();
        tacheRepository.deleteById(id);
        historiqueActionService.logAction(
            "Suppression de la tâche : " + nom,
            getEmailConnecte()
        );
    }

    @Override
    public Optional<Tache> trouverParId(Long id) {
        return tacheRepository.findById(id);
    }

    @Override
    public List<Tache> toutesLesTaches() {
        return tacheRepository.findAll();
    }

    // ✅ MODIFIÉ : Recherche par String
    @Override
    public List<Tache> trouverParType(String typeTache) {
        return tacheRepository.findByTypeTache(typeTache);
    }

    @Override
    public List<Tache> trouverParUtilisateur(Long utilisateurId) {
        return tacheRepository.findByUtilisateurId(utilisateurId);
    }

    @Override
    public List<Tache> trouverParDate(LocalDate date) {
        return tacheRepository.findByDateTache(date);
    }

    @Override
    public List<Tache> trouverEntreDeuxDates(LocalDate debut, LocalDate fin) {
        return tacheRepository.findByDateTacheBetween(debut, fin);
    }
}