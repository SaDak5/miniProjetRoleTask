import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../service/utilisateur.service';
import { AuthService } from '../service/authService.service';
import { Utilisateur } from '../models/utilisateur.model';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  erreur: string = '';
  searchTerm: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ Vérifier que l'utilisateur a le droit de LIRE les utilisateurs
    if (!this.authService.hasPermission('UTILISATEUR_READ')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    // ✅ Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.utilisateurService.listeUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = [...data].sort((a, b) => a.nom.localeCompare(b.nom));
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        } else {
          this.erreur = 'Erreur lors du chargement des utilisateurs.';
        }
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  // Getter qui filtre les utilisateurs selon le searchTerm
  get filteredUtilisateurs(): Utilisateur[] {
    if (!this.searchTerm.trim()) {
      return this.utilisateurs;
    }
    const terme = this.searchTerm.toLowerCase();
    return this.utilisateurs.filter(u => 
      u.nom.toLowerCase().includes(terme) || 
      u.prenom?.toLowerCase().includes(terme) ||
      u.email?.toLowerCase().includes(terme)
    );
  }

  // ✅ Vérifier si l'utilisateur peut modifier un utilisateur
  canUpdateUser(): boolean {
    return this.authService.hasPermission('UTILISATEUR_UPDATE');
  }

  // ✅ Vérifier si l'utilisateur peut supprimer un utilisateur
  canDeleteUser(): boolean {
    return this.authService.hasPermission('UTILISATEUR_DELETE');
  }

  // ✅ Vérifier si l'utilisateur peut créer un utilisateur
  canCreateUser(): boolean {
    return this.authService.hasPermission('UTILISATEUR_CREATE');
  }

  supprimer(u: Utilisateur) {
    // ✅ Vérifier la permission avant suppression
    if (!this.canDeleteUser()) {
      this.erreur = 'Vous n\'avez pas les droits pour supprimer un utilisateur.';
      setTimeout(() => this.erreur = '', 3000);
      return;
    }
    
    if (confirm(`Supprimer l'utilisateur "${u.prenom} ${u.nom}" ?`)) {
      this.utilisateurService.supprimerUtilisateur(u.id!).subscribe({
        next: () => this.chargerUtilisateurs(),
        error: (err) => {
          console.error('❌ Erreur suppression :', err);
          if (err.status === 403) {
            this.erreur = 'Vous n\'avez pas les droits pour supprimer cet utilisateur.';
          } else {
            this.erreur = 'Erreur lors de la suppression.';
          }
          setTimeout(() => this.erreur = '', 3000);
        }
      });
    }
  }
}