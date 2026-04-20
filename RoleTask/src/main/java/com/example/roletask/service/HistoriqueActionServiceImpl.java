package com.example.roletask.service;

import com.example.roletask.entities.HistoriqueAction;
import com.example.roletask.entities.Utilisateur;
import com.example.roletask.repos.HistoriqueActionRepository;
import com.example.roletask.repos.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HistoriqueActionServiceImpl implements HistoriqueActionService {

    private final HistoriqueActionRepository historiqueActionRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public List<HistoriqueAction> toutesLesActions() {
        return historiqueActionRepository.findAll();
    }

    @Override
    public Optional<HistoriqueAction> trouverParId(Long id) {
        return historiqueActionRepository.findById(id);
    }

    @Override
    public List<HistoriqueAction> trouverParUtilisateur(Long utilisateurId) {
        return historiqueActionRepository.findByUtilisateurId(utilisateurId);
    }

    @Override
    public HistoriqueAction enregistrer(HistoriqueAction action) {
        action.setDate(LocalDateTime.now());
        return historiqueActionRepository.save(action);
    }

    @Override
    public void supprimer(Long id) {
        if (!historiqueActionRepository.existsById(id)) {
            throw new RuntimeException("Historique non trouvé : " + id);
        }
        historiqueActionRepository.deleteById(id);
    }

    // ✅ MÉTHODE PROPRE ET FIABLE
    @Override
    public void logAction(String action, String email) {
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction(action);
        historique.setDate(LocalDateTime.now());

        Utilisateur utilisateur = getUtilisateurConnecte(email);
        historique.setUtilisateur(utilisateur);

        historiqueActionRepository.save(historique);
    }

    // 🔴 Récupération propre de l'utilisateur
    private Utilisateur getUtilisateurConnecte(String email) {

        if (email == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                email = auth.getName(); // fonctionne si username = email
            }
        }

        if (email != null) {
            return utilisateurRepository.findByEmail(email)
                    .orElse(null);
        }

        return null;
    }
}