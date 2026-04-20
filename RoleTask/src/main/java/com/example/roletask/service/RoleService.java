package com.example.roletask.service;

import com.example.roletask.entities.Role;
import java.util.List;
import java.util.Optional;

public interface RoleService {
    Role creer(Role role);
    Role modifier(Long id, Role role);
    void supprimer(Long id);
    Optional<Role> trouverParId(Long id);
    Optional<Role> trouverParNom(String nom);
    List<Role> tousLesRoles();
    boolean nomExiste(String nom);
    Role ajouterPermission(Long roleId, Long permissionId);
    Role retirerPermission(Long roleId, Long permissionId);
}
