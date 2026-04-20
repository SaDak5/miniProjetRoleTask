package com.example.roletask.service;

import com.example.roletask.entities.Permission;
import java.util.List;
import java.util.Optional;

public interface PermissionService {
    Permission creer(Permission permission);
    Permission modifier(Long id, Permission permission);
    void supprimer(Long id);
    Optional<Permission> trouverParId(Long id);
    Optional<Permission> trouverParNom(String nom);
    List<Permission> toutesLesPermissions();
    boolean nomExiste(String nom);
}
