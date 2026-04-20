import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Role } from '../models/role.model';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ Vérifier que l'utilisateur a le droit de LIRE les rôles
    if (!this.authService.hasPermission('ROLE_READ')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    // ✅ Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.chargerRoles();
  }

  chargerRoles() {
    this.utilisateurService.listeRoles().subscribe({
      next: (data) => {
        this.roles = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur :', err);
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        }
      }
    });
  }

  // ✅ Vérifier si l'utilisateur peut supprimer un rôle
  canDeleteRole(): boolean {
    return this.authService.hasPermission('ROLE_DELETE');
  }

  // ✅ Vérifier si l'utilisateur peut modifier un rôle
  canUpdateRole(): boolean {
    return this.authService.hasPermission('ROLE_UPDATE');
  }

  // ✅ Vérifier si l'utilisateur peut créer un rôle
  canCreateRole(): boolean {
    return this.authService.hasPermission('ROLE_CREATE');
  }

  supprimerRole(r: Role) {
    // ✅ Vérifier la permission avant suppression
    if (!this.canDeleteRole()) {
      console.error('Permission refusée pour supprimer un rôle');
      return;
    }
    
    if (confirm(`Supprimer le rôle "${r.nom}" ?`)) {
      this.utilisateurService.supprimerRole(r.id!).subscribe({
        next: () => this.chargerRoles(),
        error: (err) => {
          console.error('❌ Erreur suppression :', err);
          if (err.status === 403) {
            alert('Vous n\'avez pas les droits pour supprimer ce rôle.');
          }
        }
      });
    }
  }
}