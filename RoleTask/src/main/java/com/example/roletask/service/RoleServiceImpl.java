package com.example.roletask.service;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Role;
import com.example.roletask.repos.PermissionRepository;
import com.example.roletask.repos.RoleRepository;
import com.example.roletask.repos.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HistoriqueActionService historiqueActionService;

    private String getEmailConnecte() {
        return SecurityContextHolder.getContext()
            .getAuthentication().getName();
    }

    @Override
    @Transactional
    public Role creer(Role role) {
        if (roleRepository.existsByNom(role.getNom())) {
            throw new RuntimeException("Un rôle avec ce nom existe déjà : " + role.getNom());
        }

        // ✅ Gérer les permissions (existantes OU nouvelles)
        if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
            List<Permission> permissionsFinales = new ArrayList<>();
            for (Permission p : role.getPermissions()) {
                if (p.getId() != null) {
                    // Permission existante
                    Permission permTrouvee = permissionRepository.findById(p.getId())
                        .orElseThrow(() -> new RuntimeException(
                            "Permission non trouvée avec l'id : " + p.getId()));
                    permissionsFinales.add(permTrouvee);
                } else if (p.getNom() != null && !p.getNom().isEmpty()) {
                    // ✅ Nouvelle permission - la créer d'abord
                    Permission nouvellePermission = Permission.builder()
                        .nom(p.getNom())
                        .description(p.getDescription())
                        .build();
                    Permission saved = permissionRepository.save(nouvellePermission);
                    permissionsFinales.add(saved);
                    System.out.println("✅ Nouvelle permission créée: " + saved.getNom());
                }
            }
            role.setPermissions(permissionsFinales);
        }

        Role saved = roleRepository.save(role);
        System.out.println("✅ Rôle créé: " + saved.getNom() + " avec " + saved.getPermissions().size() + " permissions");
        
        historiqueActionService.logAction(
            "Création du rôle : " + saved.getNom(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public Role modifier(Long id, Role roleModifie) {
        Role existant = roleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rôle non trouvé : " + id));

        existant.setNom(roleModifie.getNom());
        existant.setDescription(roleModifie.getDescription());

        // ✅ Gérer les permissions (existantes OU nouvelles)
        if (roleModifie.getPermissions() != null) {
            List<Permission> permissionsFinales = new ArrayList<>();
            for (Permission p : roleModifie.getPermissions()) {
                if (p.getId() != null) {
                    Permission permTrouvee = permissionRepository.findById(p.getId())
                        .orElseThrow(() -> new RuntimeException(
                            "Permission non trouvée avec l'id : " + p.getId()));
                    permissionsFinales.add(permTrouvee);
                } else if (p.getNom() != null && !p.getNom().isEmpty()) {
                    Permission nouvellePermission = Permission.builder()
                        .nom(p.getNom())
                        .description(p.getDescription())
                        .build();
                    Permission saved = permissionRepository.save(nouvellePermission);
                    permissionsFinales.add(saved);
                }
            }
            existant.setPermissions(permissionsFinales);
        }

        Role saved = roleRepository.save(existant);
        historiqueActionService.logAction(
            "Modification du rôle : " + saved.getNom(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public void supprimer(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rôle non trouvé : " + id));

        String nomRole = role.getNom();
        role.getPermissions().clear();
        roleRepository.saveAndFlush(role);

        if (role.getUtilisateurs() != null && !role.getUtilisateurs().isEmpty()) {
            role.getUtilisateurs().forEach(u -> u.setRole(null));
            utilisateurRepository.saveAll(role.getUtilisateurs());
        }

        roleRepository.deleteById(id);
        historiqueActionService.logAction(
            "Suppression du rôle : " + nomRole,
            getEmailConnecte()
        );
    }

    @Override
    public Optional<Role> trouverParId(Long id) {
        return roleRepository.findById(id);
    }

    @Override
    public Optional<Role> trouverParNom(String nom) {
        return roleRepository.findByNom(nom);
    }

    @Override
    public List<Role> tousLesRoles() {
        return roleRepository.findAll();
    }

    @Override
    public boolean nomExiste(String nom) {
        return roleRepository.existsByNom(nom);
    }

    @Override
    @Transactional
    public Role ajouterPermission(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Rôle non trouvé : " + roleId));
        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new RuntimeException("Permission non trouvée : " + permissionId));

        if (!role.getPermissions().contains(permission)) {
            role.getPermissions().add(permission);
        }
        Role saved = roleRepository.save(role);
        historiqueActionService.logAction(
            "Ajout permission " + permission.getNom() + " au rôle " + role.getNom(),
            getEmailConnecte()
        );
        return saved;
    }

    @Override
    @Transactional
    public Role retirerPermission(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Rôle non trouvé : " + roleId));
        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new RuntimeException("Permission non trouvée : " + permissionId));

        role.getPermissions().remove(permission);
        Role saved = roleRepository.save(role);
        historiqueActionService.logAction(
            "Retrait permission " + permission.getNom() + " du rôle " + role.getNom(),
            getEmailConnecte()
        );
        return saved;
    }
}