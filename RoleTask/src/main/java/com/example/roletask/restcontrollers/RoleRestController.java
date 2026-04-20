package com.example.roletask.restcontrollers;

import com.example.roletask.entities.Role;
import com.example.roletask.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleRestController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<List<Role>> getAll() {
        return ResponseEntity.ok(roleService.tousLesRoles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<Role> getById(@PathVariable Long id) {
        return roleService.trouverParId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nom/{nom}")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<Role> getByNom(@PathVariable String nom) {
        return roleService.trouverParNom(nom)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ResponseEntity<Role> create(@RequestBody Role role) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(roleService.creer(role));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public ResponseEntity<Role> update(@PathVariable Long id, @RequestBody Role role) {
        try {
            return ResponseEntity.ok(roleService.modifier(id, role));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            roleService.supprimer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    public ResponseEntity<Role> addPermission(@PathVariable Long roleId, @PathVariable Long permissionId) {
        try {
            return ResponseEntity.ok(roleService.ajouterPermission(roleId, permissionId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public ResponseEntity<Role> removePermission(@PathVariable Long roleId, @PathVariable Long permissionId) {
        try {
            return ResponseEntity.ok(roleService.retirerPermission(roleId, permissionId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}