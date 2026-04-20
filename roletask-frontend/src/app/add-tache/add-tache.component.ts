import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tache, typesTachePredifinis } from '../models/tache.model';
import { Utilisateur } from '../models/utilisateur.model';
import { UtilisateurService } from '../service/utilisateur.service';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-add-tache',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-tache.component.html',
  styleUrls: ['./add-tache.component.css']
})
export class AddTacheComponent implements OnInit {

  tache: Tache = {
    nomDuTache: '',
    typeTache: 'REUNION',
    dateTache: '',
    periodeTache: 0
  };

  // ✅ Types prédéfinis + option AUTRE
  typesTache: string[] = [...typesTachePredifinis, 'AUTRE'];

  erreur: string = '';
  succes: string = '';
  chargement: boolean = false;
  autreTypeValue: string = '';  // ✅ Valeur du type personnalisé
  showAutreInput: boolean = false;  // ✅ Afficher ou non le champ "Autre"
  today: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.hasPermission('TACHE_CREATE')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.today = new Date().toISOString().split('T')[0];
    this.chargerUtilisateurConnecte();
  }

  chargerUtilisateurConnecte() {
    const email = this.authService.getEmail();
    if (!email) return;

    this.utilisateurService.getUtilisateurParEmail(email).subscribe({
      next: (utilisateur: Utilisateur) => {
        this.tache.utilisateur = utilisateur;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement utilisateur :', err);
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        }
      }
    });
  }

  // ✅ Gérer le changement de type
  onTypeChange(): void {
    if (this.tache.typeTache === 'AUTRE') {
      this.showAutreInput = true;
    } else {
      this.showAutreInput = false;
      this.autreTypeValue = '';
    }
  }

  sauvegarder() {
    const todayDate = new Date().toISOString().split('T')[0];

    if (!this.authService.hasPermission('TACHE_CREATE')) {
      this.erreur = 'Vous n\'avez pas les droits pour créer une tâche.';
      return;
    }

    if (!this.tache.nomDuTache?.trim()) {
      this.erreur = 'Le nom de la tâche est obligatoire.';
      return;
    }

    // ✅ Gestion du type "AUTRE"
    if (this.tache.typeTache === 'AUTRE') {
      if (!this.autreTypeValue?.trim()) {
        this.erreur = 'Veuillez saisir un type de tâche personnalisé.';
        return;
      }
      this.tache.typeTache = this.autreTypeValue;
    }

    if (!this.tache.typeTache) {
      this.erreur = 'Le type de la tâche est obligatoire.';
      return;
    }

    if (!this.tache.dateTache) {
      this.erreur = 'La date est obligatoire.';
      return;
    }

    if (this.tache.dateTache < todayDate) {
      this.erreur = 'La date doit être aujourd’hui ou une date future.';
      return;
    }

    if (!this.tache.periodeTache || this.tache.periodeTache <= 0) {
      this.erreur = 'La durée doit être supérieure à 0.';
      return;
    }

    this.chargement = true;
    this.erreur = '';

    this.utilisateurService.ajouterTache(this.tache).subscribe({
      next: () => {
        this.succes = 'Tâche ajoutée avec succès.';
        this.chargement = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/taches']), 1000);
      },
      error: (err) => {
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour ajouter une tâche.';
        } else {
          this.erreur = 'Erreur lors de l\'ajout de la tâche.';
        }
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  annuler() {
    this.router.navigate(['/taches']);
  }
}