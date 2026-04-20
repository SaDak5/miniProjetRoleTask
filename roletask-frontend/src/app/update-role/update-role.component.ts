import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-update-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-role.component.html'
})
export class UpdateRoleComponent implements OnInit {

  role!: Role;
  toutesPermissions: Permission[] = [];
  selectedPermissionIds: number[] = [];
  erreur: string = '';
  succes: string = '';
  chargement: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ Vérifier que l'utilisateur a le droit de MODIFIER un rôle
    if (!this.authService.hasPermission('ROLE_UPDATE')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    // ✅ Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    const id = this.route.snapshot.params['id'];
    this.loadRole(id);
    this.loadPermissions();
  }

  loadRole(id: number): void {
    this.utilisateurService.consulterRole(id).subscribe({
      next: (data) => {
        this.role = data;
        // pré-sélectionner les permissions existantes
        this.selectedPermissionIds = data.permissions
          ? data.permissions.map(p => p.id!)
          : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour modifier ce rôle.';
          setTimeout(() => this.router.navigate(['/roles']), 2000);
        } else if (err.status === 404) {
          this.erreur = 'Rôle introuvable.';
        } else {
          this.erreur = 'Erreur lors du chargement du rôle.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadPermissions(): void {
    // ✅ Vérifier si l'utilisateur peut voir les permissions
    if (!this.authService.hasPermission('PERMISSION_READ')) {
      this.toutesPermissions = [];
      this.cdr.detectChanges();
      return;
    }
    
    this.utilisateurService.listePermissions().subscribe({
      next: (data) => {
        this.toutesPermissions = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur permissions :', err);
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour voir les permissions.';
        }
      }
    });
  }

  // ✅ Vérifier si l'utilisateur peut assigner des permissions
  canAssignPermissions(): boolean {
    return this.authService.hasPermission('PERMISSION_CREATE');
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

  confirmer() {
    // ✅ Vérifier à nouveau la permission avant modification
    if (!this.authService.hasPermission('ROLE_UPDATE')) {
      this.erreur = 'Vous n\'avez pas les droits pour modifier un rôle.';
      setTimeout(() => this.router.navigate(['/roles']), 2000);
      return;
    }
    
    if (!this.role.nom?.trim()) {
      this.erreur = 'Le nom du rôle est obligatoire.';
      return;
    }

    this.chargement = true;
    this.erreur = '';

    // ✅ Si l'utilisateur ne peut pas assigner de permissions, garder les anciennes
    let permissionsToSend = this.role.permissions;
    if (this.canAssignPermissions()) {
      permissionsToSend = this.selectedPermissionIds.map(id => ({ id, nom: '' }));
    }

    const roleAModifier: Role = {
      ...this.role,
      permissions: permissionsToSend
    };

    this.utilisateurService.modifierRole(this.role.id!, roleAModifier).subscribe({
      next: () => {
        this.succes = 'Rôle modifié avec succès !';
        this.chargement = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/roles']), 1000);
      },
      error: (err) => {
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour modifier ce rôle.';
        } else if (err.status === 409) {
          this.erreur = 'Un rôle avec ce nom existe déjà.';
        } else {
          this.erreur = 'Erreur lors de la modification.';
        }
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  annuler() {
    this.router.navigate(['/roles']);
  }
}