import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Utilisateur } from '../models/utilisateur.model';
import { Tache, typesTachePredifinis } from '../models/tache.model';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-update-tache',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-tache.component.html'
})
export class UpdateTacheComponent implements OnInit {

  tache!: Tache;
  typesTache: string[] = [...typesTachePredifinis, 'AUTRE'];  // ✅ Types prédéfinis + AUTRE
  erreur: string = '';
  succes: string = '';
  chargement: boolean = false;
  utilisateurConnecte!: Utilisateur;
  autreTypeValue: string = '';
  showAutreInput: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.hasPermission('TACHE_UPDATE')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadUtilisateurConnecte();
    
    const id = this.route.snapshot.params['id'];
    this.loadTache(id);
  }

  loadUtilisateurConnecte(): void {
    const email = this.authService.getEmail();
    if (email) {
      this.utilisateurService.getUtilisateurParEmail(email).subscribe({
        next: (utilisateur) => {
          this.utilisateurConnecte = utilisateur;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement utilisateur connecté :', err);
        }
      });
    }
  }

  loadTache(id: number): void {
    this.utilisateurService.consulterTache(id).subscribe({
      next: (data) => {
        this.tache = data;
        
        // ✅ Vérifier si le type de la tâche est dans la liste prédéfinie
        if (this.tache.typeTache && !typesTachePredifinis.includes(this.tache.typeTache)) {
          this.autreTypeValue = this.tache.typeTache;
          this.tache.typeTache = 'AUTRE';
          this.showAutreInput = true;
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour modifier cette tâche.';
          setTimeout(() => this.router.navigate(['/taches']), 2000);
        } else if (err.status === 404) {
          this.erreur = 'Tâche introuvable.';
        } else {
          this.erreur = 'Erreur lors du chargement de la tâche.';
        }
        console.error(err);
      }
    });
  }

  onTypeChange(): void {
    if (this.tache.typeTache === 'AUTRE') {
      this.showAutreInput = true;
    } else {
      this.showAutreInput = false;
      this.autreTypeValue = '';
    }
  }

  confirmer() {
    if (!this.authService.hasPermission('TACHE_UPDATE')) {
      this.erreur = 'Vous n\'avez pas les droits pour modifier une tâche.';
      setTimeout(() => this.router.navigate(['/taches']), 2000);
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
      this.erreur = 'Le type est obligatoire.';
      return;
    }
    
    if (!this.tache.dateTache) {
      this.erreur = 'La date est obligatoire.';
      return;
    }
    
    if (!this.tache.periodeTache) {
      this.erreur = 'La période est obligatoire.';
      return;
    }

    this.chargement = true;
    this.erreur = '';

    this.tache.utilisateur = this.utilisateurConnecte;

    this.utilisateurService.modifierTache(this.tache.id!, this.tache).subscribe({
      next: () => {
        this.succes = 'Tâche modifiée avec succès !';
        this.chargement = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/taches']), 1000);
      },
      error: (err) => {
        if (err.status === 403) {
          this.erreur = 'Vous n\'avez pas les droits pour modifier cette tâche.';
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
    this.router.navigate(['/taches']);
  }
}