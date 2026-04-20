import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { AuthService } from '../service/authService.service';
import { Utilisateur } from '../models/utilisateur.model';
import { Role } from '../models/role.model';

@Component({
  selector: 'app-update-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-utilisateur.component.html'
})
export class UpdateUtilisateurComponent implements OnInit {

  utilisateur!: Utilisateur;
  roles: Role[] = [];
  erreur: string = '';
  succes: string = '';
  chargement: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    public authService: AuthService,   // ← CHANGÉ: private → public
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ Vérifier que l'utilisateur a le droit de MODIFIER un utilisateur
    if (!this.authService.hasPermission('UTILISATEUR_UPDATE')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    // ✅ Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    const id = Number(this.route.snapshot.params['id']);
    this.loadUtilisateur(id);
    this.loadRoles();
  }

  loadUtilisateur(id: number): void {
    this.utilisateurService.consulterUtilisateur(id).subscribe({
      next: (data) => {
        this.utilisateur = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour modifier cet utilisateur.';
          setTimeout(() => this.router.navigate(['/utilisateurs']), 2000);
        } else if (err.status === 404) {
          this.erreur = 'Utilisateur introuvable.';
        } else {
          this.erreur = 'Erreur lors du chargement de l\'utilisateur.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadRoles(): void {
    // ✅ Vérifier si l'utilisateur peut voir la liste des rôles
    if (this.authService.hasPermission('ROLE_READ')) {
      this.utilisateurService.listeRoles().subscribe({
        next: (data) => {
          this.roles = [...data];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('❌ Erreur chargement rôles :', err)
      });
    }
  }

  confirmer() {
    // ✅ Vérifier à nouveau la permission avant modification
    if (!this.authService.hasPermission('UTILISATEUR_UPDATE')) {
      this.erreur = 'Vous n\'avez pas les droits pour modifier un utilisateur.';
      setTimeout(() => this.router.navigate(['/utilisateurs']), 2000);
      return;
    }
    
    if (!this.utilisateur.nom?.trim() || !this.utilisateur.prenom?.trim()) {
      this.erreur = 'Nom et prénom sont obligatoires.';
      return;
    }
    if (!this.utilisateur.email?.trim()) {
      this.erreur = 'Email est obligatoire.';
      return;
    }

    this.chargement = true;
    this.erreur = '';

    const payload: Utilisateur = {
      ...this.utilisateur,
      motDePasse: this.utilisateur.motDePasse?.trim()
        ? this.utilisateur.motDePasse
        : undefined
    };

    this.utilisateurService
      .modifierUtilisateur(this.utilisateur.id!, payload)
      .subscribe({
        next: () => {
          this.succes = 'Utilisateur modifié avec succès !';
          this.chargement = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/utilisateurs']), 1000);
        },
        error: (err) => {
          if (err.status === 403) {
            this.erreur = 'Vous n\'avez pas les droits pour modifier cet utilisateur.';
          } else {
            this.erreur = 'Erreur lors de la modification.';
          }
          this.chargement = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
  }

  annuler() {
    this.router.navigate(['/utilisateurs']);
  }
}