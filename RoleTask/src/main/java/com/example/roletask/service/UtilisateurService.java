package com.example.roletask.service;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Utilisateur;
import java.util.List;
import java.util.Optional;

public interface UtilisateurService {
    Utilisateur creer(Utilisateur utilisateur);
    Utilisateur modifier(Long id, Utilisateur utilisateur);
    void supprimer(Long id);
    Optional<Utilisateur> trouverParId(Long id);
    Optional<Utilisateur> trouverParEmail(String email);
    List<Utilisateur> tousLesUtilisateurs();
    boolean emailExiste(String email);
    List<Permission> getPermissionsUtilisateur(Long utilisateurId);
    
    List<Utilisateur> trouverParNom(String nom);
}
