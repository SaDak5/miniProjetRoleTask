package com.example.roletask.service;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Role;
import com.example.roletask.repos.PermissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final HistoriqueActionService historiqueActionService;

    private String getEmailConnecte() {
        return SecurityContextHolder.getContext()
            .getAuthentication().getName();
    }

    @Override
    public Permission creer(Permission permission) {
        if (permissionRepository.existsByNom(permission.getNom())) {
            throw new RuntimeException(
                "Une permission avec ce nom existe déjà : " + permission.getNom());
        }
        Permission saved = permissionRepository.save(permission);
        historiqueActionService.logAction(
            "Création de la permission : " + saved.getNom(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    public Permission modifier(Long id, Permission permission) {
        Permission existante = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(
                "Permission non trouvée avec l'id : " + id));
        existante.setNom(permission.getNom());
        existante.setDescription(permission.getDescription());
        Permission saved = permissionRepository.save(existante);
        historiqueActionService.logAction(
            "Modification de la permission : " + saved.getNom(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public void supprimer(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(
                "Permission non trouvée avec l'id : " + id));

        String nom = permission.getNom();

        // nettoyer les associations avec les rôles
        if (permission.getRoles() != null) {
            for (Role role : permission.getRoles()) {
                role.getPermissions().remove(permission);
            }
            permission.getRoles().clear();
        }

        permissionRepository.delete(permission);
        historiqueActionService.logAction(
            "Suppression de la permission : " + nom,
            getEmailConnecte()
        );
    }

    @Override
    public Optional<Permission> trouverParId(Long id) {
        return permissionRepository.findById(id);
    }

    @Override
    public Optional<Permission> trouverParNom(String nom) {
        return permissionRepository.findByNom(nom);
    }

    @Override
    public List<Permission> toutesLesPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public boolean nomExiste(String nom) {
        return permissionRepository.existsByNom(nom);
    }
}