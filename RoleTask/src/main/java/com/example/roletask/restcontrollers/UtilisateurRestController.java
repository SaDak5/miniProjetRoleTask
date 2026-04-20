package com.example.roletask.restcontrollers;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Utilisateur;
import com.example.roletask.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurRestController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    @PreAuthorize("hasAuthority('UTILISATEUR_READ')")
    public ResponseEntity<List<Utilisateur>> getAll() {
        return ResponseEntity.ok(utilisateurService.tousLesUtilisateurs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('UTILISATEUR_READ')")
    public ResponseEntity<Utilisateur> getById(@PathVariable Long id) {
        return utilisateurService.trouverParId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAuthority('UTILISATEUR_READ')")
    public ResponseEntity<Utilisateur> getByEmail(@PathVariable String email) {
        return utilisateurService.trouverParEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('UTILISATEUR_CREATE')")
    public ResponseEntity<Utilisateur> create(@RequestBody Utilisateur utilisateur) {
        try {
            Utilisateur created = utilisateurService.creer(utilisateur);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UTILISATEUR_UPDATE')")
    public ResponseEntity<Utilisateur> update(@PathVariable Long id, @RequestBody Utilisateur utilisateur) {
        try {
            return ResponseEntity.ok(utilisateurService.modifier(id, utilisateur));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('UTILISATEUR_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            utilisateurService.supprimer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('UTILISATEUR_READ')")
    public ResponseEntity<List<Permission>> getPermissions(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(utilisateurService.getPermissionsUtilisateur(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/nom/{nom}")
    @PreAuthorize("hasAuthority('UTILISATEUR_READ')")
    public ResponseEntity<List<Utilisateur>> getByNom(@PathVariable String nom) {
        List<Utilisateur> utilisateurs = utilisateurService.trouverParNom(nom);
        if (utilisateurs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(utilisateurs);
    }
}