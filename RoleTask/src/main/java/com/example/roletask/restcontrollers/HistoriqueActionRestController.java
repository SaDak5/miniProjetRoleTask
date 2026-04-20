package com.example.roletask.restcontrollers;

import com.example.roletask.entities.HistoriqueAction;
import com.example.roletask.service.HistoriqueActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historiques")
@RequiredArgsConstructor
public class HistoriqueActionRestController {

    private final HistoriqueActionService historiqueActionService;

    @GetMapping
    @PreAuthorize("hasAuthority('HISTORIQUE_READ')")
    public ResponseEntity<List<HistoriqueAction>> getAll() {
        return ResponseEntity.ok(historiqueActionService.toutesLesActions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HISTORIQUE_READ')")
    public ResponseEntity<HistoriqueAction> getById(@PathVariable Long id) {
        return historiqueActionService.trouverParId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/utilisateur/{utilisateurId}")
    @PreAuthorize("hasAuthority('HISTORIQUE_READ')")
    public ResponseEntity<List<HistoriqueAction>> getByUtilisateur(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(historiqueActionService.trouverParUtilisateur(utilisateurId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('HISTORIQUE_CREATE')")
    public ResponseEntity<HistoriqueAction> create(@RequestBody HistoriqueAction action) {
        return ResponseEntity.status(HttpStatus.CREATED).body(historiqueActionService.enregistrer(action));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HISTORIQUE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            historiqueActionService.supprimer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}