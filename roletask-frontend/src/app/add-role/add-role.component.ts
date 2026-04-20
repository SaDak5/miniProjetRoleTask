import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-role.component.html'
})
export class AddRoleComponent implements OnInit {
  role: Role = { nom: '', description: '', permissions: [] };
  permissions: Permission[] = [];
  selectedPermissionIds: number[] = [];
  erreur: string = '';
  succes: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ Vérifier que l'utilisateur a le droit de CRÉER un rôle
    if (!this.authService.hasPermission('ROLE_CREATE')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    // ✅ Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.chargerPermissions();
  }

  chargerPermissions() {
    // ✅ Vérifier si l'utilisateur peut voir les permissions
    if (!this.authService.hasPermission('PERMISSION_READ')) {
      // Si pas de permission, on ne charge pas les permissions
      this.permissions = [];
      this.cdr.detectChanges();
      return;
    }
    
    this.utilisateurService.listePermissions().subscribe({
      next: (data) => {
        this.permissions = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement permissions :', err);
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        }
      }
    });
  }

  togglePermission(id: number) {
    const index = this.selectedPermissionIds.indexOf(id);
    if (index === -1) {
      this.selectedPermissionIds.push(id);
    } else {
      this.selectedPermissionIds.splice(index, 1);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedPermissionIds.includes(id);
  }

  // ✅ Vérifier si l'utilisateur peut ajouter des permissions
  canAddPermissions(): boolean {
    return this.authService.hasPermission('PERMISSION_CREATE');
  }

  sauvegarder() {
    // ✅ Vérifier à nouveau la permission avant sauvegarde
    if (!this.authService.hasPermission('ROLE_CREATE')) {
      this.erreur = 'Vous n\'avez pas les droits pour créer un rôle.';
      setTimeout(() => this.router.navigate(['/roles']), 2000);
      return;
    }
    
    if (!this.role.nom.trim()) {
      this.erreur = 'Le nom du rôle est obligatoire.';
      return;
    }

    this.erreur = '';

    this.utilisateurService.ajouterRole(this.role).subscribe({
      next: (roleCree) => {
        // ✅ Vérifier si l'utilisateur peut ajouter des permissions
        if (!this.canAddPermissions()) {
          this.succes = 'Rôle créé avec succès (sans permissions).';
          setTimeout(() => this.router.navigate(['/roles']), 1000);
          return;
        }
        
        const ajouts = this.selectedPermissionIds.map(permId =>
          this.utilisateurService.ajouterPermissionARole(roleCree.id!, permId)
        );

        if (ajouts.length === 0) {
          this.succes = 'Rôle créé avec succès.';
          setTimeout(() => this.router.navigate(['/roles']), 1000);
          return;
        }

        let count = 0;
        ajouts.forEach(obs => {
          obs.subscribe({
            next: () => {
              count++;
              if (count === ajouts.length) {
                this.succes = 'Rôle créé avec succès.';
                setTimeout(() => this.router.navigate(['/roles']), 1000);
              }
            },
            error: (err) => {
              console.error('❌ Erreur ajout permission :', err);
              if (err.status === 403) {
                this.erreur = 'Rôle créé mais impossible d\'ajouter les permissions (droits insuffisants).';
              }
            }
          });
        });
      },
      error: (err) => {
        if (err.status === 409) {
          this.erreur = 'Un rôle avec ce nom existe déjà.';
        } else if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour créer un rôle.';
        } else {
          this.erreur = 'Erreur lors de la création du rôle.';
        }
        console.error(err);
      }
    });
  }

  annuler() {
    this.router.navigate(['/roles']);
  }
}