import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UtilisateurService } from '../service/utilisateur.service';
import { Permission } from '../models/permission.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  permissions: Permission[] = [];
  resultat: any = null;
  resultatTitre: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerPermissions();
  }

  chargerPermissions() {
    this.utilisateurService.listePermissions().subscribe({
      next: (data) => {
        this.permissions = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Erreur :', err)
    });
  }

  // ← méthode centrale qui mappe chaque permission à une méthode du service
  executerPermission(nomPermission: string) {
    this.resultat = null;
    this.resultatTitre = nomPermission;

    switch (nomPermission) {

      // ── ROLES ──────────────────────────────────────────
      case 'ROLE_READ':
        this.utilisateurService.listeRoles().subscribe({
          next: (data) => { this.resultat = data; this.cdr.detectChanges(); }
        });
        break;

      case 'ROLE_CREATE':
        this.resultat = '→ Redirige vers /roles/ajouter';
        break;

      case 'ROLE_UPDATE':
        this.resultat = '→ Redirige vers /update-role/:id';
        break;

      case 'ROLE_DELETE':
        this.resultat = '→ Appelle supprimerRole(id)';
        break;

      // ── PERMISSIONS ────────────────────────────────────
      case 'PERMISSION_READ':
        this.utilisateurService.listePermissions().subscribe({
          next: (data) => { this.resultat = data; this.cdr.detectChanges(); }
        });
        break;

      case 'PERMISSION_CREATE':
        this.resultat = '→ Redirige vers /permissions/ajouter';
        break;

      case 'PERMISSION_UPDATE':
        this.resultat = '→ Redirige vers /update-permission/:id';
        break;

      case 'PERMISSION_DELETE':
        this.resultat = '→ Appelle supprimerPermission(id)';
        break;

      // ── UTILISATEURS ───────────────────────────────────
      case 'UTILISATEUR_READ':
        this.utilisateurService.listeUtilisateurs().subscribe({
          next: (data) => { this.resultat = data; this.cdr.detectChanges(); }
        });
        break;

      case 'UTILISATEUR_CREATE':
        this.resultat = '→ Redirige vers /utilisateurs/ajouter';
        break;

      case 'UTILISATEUR_UPDATE':
        this.resultat = '→ Redirige vers /update-utilisateur/:id';
        break;

      case 'UTILISATEUR_DELETE':
        this.resultat = '→ Appelle supprimerUtilisateur(id)';
        break;

      // ── TACHES ─────────────────────────────────────────
      case 'TACHE_READ':
        this.utilisateurService.listeTaches().subscribe({
          next: (data) => { this.resultat = data; this.cdr.detectChanges(); }
        });
        break;

      case 'TACHE_CREATE':
        this.resultat = '→ Redirige vers /taches/ajouter';
        break;

      case 'TACHE_UPDATE':
        this.resultat = '→ Redirige vers /update-tache/:id';
        break;

      case 'TACHE_DELETE':
        this.resultat = '→ Appelle supprimerTache(id)';
        break;

      // ── HISTORIQUES ────────────────────────────────────
      case 'HISTORIQUE_READ':
        this.utilisateurService.listeHistoriques().subscribe({
          next: (data) => { this.resultat = data; this.cdr.detectChanges(); }
        });
        break;

      case 'HISTORIQUE_CREATE':
        this.resultat = '→ Appelle ajouterHistorique()';
        break;

      case 'HISTORIQUE_UPDATE':
        this.resultat = '→ Redirige vers /update-historique/:id';
        break;

      case 'HISTORIQUE_DELETE':
        this.resultat = '→ Appelle supprimerHistorique(id)';
        break;

      default:
        this.resultat = 'Permission non reconnue';
    }

    this.cdr.detectChanges();
  }

  getBadgeClass(nom: string): string {
    if (nom.endsWith('_READ'))   return 'badge bg-info text-dark';
    if (nom.endsWith('_CREATE')) return 'badge bg-success';
    if (nom.endsWith('_UPDATE')) return 'badge bg-warning text-dark';
    if (nom.endsWith('_DELETE')) return 'badge bg-danger';
    return 'badge bg-secondary';
  }

  supprimerPermission(p: Permission) {
    if (confirm(`Supprimer la permission "${p.nom}" ?`)) {
      this.utilisateurService.supprimerPermission(p.id!).subscribe({
        next: () => this.chargerPermissions(),
        error: (err) => console.error('❌ Erreur suppression :', err)
      });
    }
  }
}