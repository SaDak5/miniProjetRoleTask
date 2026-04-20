package com.example.roletask.restcontrollers;

import com.example.roletask.entities.Tache;
import com.example.roletask.service.TacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
public class TacheRestController {

    private final TacheService tacheService;

    @GetMapping
    @PreAuthorize("hasAuthority('TACHE_READ')")
    public ResponseEntity<List<Tache>> getAll() {
        return ResponseEntity.ok(tacheService.toutesLesTaches());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TACHE_READ')")
    public ResponseEntity<Tache> getById(@PathVariable Long id) {
        return tacheService.trouverParId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ✅ CORRIGÉ : utiliser trouverParType au lieu de trouverParTypeString
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAuthority('TACHE_READ')")
    public ResponseEntity<List<Tache>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(tacheService.trouverParType(type));
    }

    @GetMapping("/utilisateur/{utilisateurId}")
    @PreAuthorize("hasAuthority('TACHE_READ')")
    public ResponseEntity<List<Tache>> getByUtilisateur(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(tacheService.trouverParUtilisateur(utilisateurId));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAuthority('TACHE_READ')")
    public ResponseEntity<List<Tache>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(tacheService.trouverParDate(date));
    }

    @GetMapping("/periode")
    @PreAuthorize("hasAuthority('TACHE_READ')")
    public ResponseEntity<List<Tache>> getBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(tacheService.trouverEntreDeuxDates(debut, fin));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('TACHE_CREATE')")
    public ResponseEntity<Tache> create(@RequestBody Tache tache) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(tacheService.creer(tache));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TACHE_UPDATE')")
    public ResponseEntity<Tache> update(@PathVariable Long id, @RequestBody Tache tache) {
        try {
            return ResponseEntity.ok(tacheService.modifier(id, tache));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TACHE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            tacheService.supprimer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}