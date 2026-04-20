package com.example.roletask.service;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Role;
import com.example.roletask.entities.Utilisateur;
import com.example.roletask.repos.RoleRepository;
import com.example.roletask.repos.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final HistoriqueActionService historiqueActionService;
    private final PasswordEncoder passwordEncoder;

    private String getEmailConnecte() {
        try {
            return SecurityContextHolder.getContext()
                .getAuthentication().getName();
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    @Transactional
    public Utilisateur creer(Utilisateur utilisateur) {
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + utilisateur.getEmail());
        }

        if (utilisateur.getMotDePasse() != null && !utilisateur.getMotDePasse().isEmpty()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        }

        if (utilisateur.getRole() != null && utilisateur.getRole().getId() != null) {
            Role role = roleRepository.findById(utilisateur.getRole().getId())
                .orElseThrow(() -> new RuntimeException(
                    "Rôle non trouvé : " + utilisateur.getRole().getId()));
            utilisateur.setRole(role);
        }

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        historiqueActionService.logAction(
            "Création de l'utilisateur : " + saved.getEmail(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public Utilisateur modifier(Long id, Utilisateur utilisateur) {
        Utilisateur existant = utilisateurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));

        // ✅ Vérifier unicité email uniquement si l'email change
        if (!existant.getEmail().equals(utilisateur.getEmail())
                && utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + utilisateur.getEmail());
        }

        existant.setNom(utilisateur.getNom());
        existant.setPrenom(utilisateur.getPrenom());
        existant.setEmail(utilisateur.getEmail());
        existant.setNumTelephone(utilisateur.getNumTelephone());

        // ✅ Ne modifier le mot de passe QUE s'il est fourni, non vide,
        //    ET qu'il n'est PAS déjà un hash bcrypt (évite le double encodage)
        String mdp = utilisateur.getMotDePasse();
        if (mdp != null && !mdp.trim().isEmpty()
                && !mdp.startsWith("$2a$") && !mdp.startsWith("$2b$")) {
            existant.setMotDePasse(passwordEncoder.encode(mdp));
        }

        // ✅ Mise à jour du rôle
        if (utilisateur.getRole() != null && utilisateur.getRole().getId() != null) {
            Role role = roleRepository.findById(utilisateur.getRole().getId())
                .orElseThrow(() -> new RuntimeException(
                    "Rôle non trouvé : " + utilisateur.getRole().getId()));
            existant.setRole(role);
        } else {
            existant.setRole(null);
        }

        Utilisateur saved = utilisateurRepository.save(existant);
        historiqueActionService.logAction(
            "Modification de l'utilisateur : " + saved.getEmail(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public void supprimer(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));
        String email = utilisateur.getEmail();
        utilisateurRepository.deleteById(id);
        historiqueActionService.logAction(
            "Suppression de l'utilisateur : " + email,
            getEmailConnecte()
        );
    }

    @Override
    public Optional<Utilisateur> trouverParId(Long id) {
        return utilisateurRepository.findById(id);
    }

    @Override
    public Optional<Utilisateur> trouverParEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    @Override
    public List<Utilisateur> tousLesUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    @Override
    public boolean emailExiste(String email) {
        return utilisateurRepository.existsByEmail(email);
    }

    @Override
    public List<Permission> getPermissionsUtilisateur(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + utilisateurId));

        if (utilisateur.getRole() == null) {
            throw new RuntimeException("Cet utilisateur n'a pas de rôle assigné");
        }

        return utilisateur.getRole().getPermissions();
    }

    @Override
    public List<Utilisateur> trouverParNom(String nom) {
        return utilisateurRepository.findByNom(nom);
    }
}