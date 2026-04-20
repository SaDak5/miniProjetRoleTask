import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Tache } from '../models/tache.model';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-tache',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './taches.component.html',
  styleUrls: ['./taches.component.css']
})
export class TachesComponent implements OnInit {

  taches: Tache[] = [];
  errorMessage: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.hasPermission('TACHE_READ')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    
    this.loadTaches();
  }

  loadTaches(): void {
    this.utilisateurService.listeTaches().subscribe({
      next: (data) => {
        this.taches = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        } else {
          this.errorMessage = 'Erreur lors du chargement des tâches';
        }
        this.cdr.detectChanges();
      }
    });
  }

  canEditTache(): boolean {
    return this.authService.hasPermission('TACHE_UPDATE');
  }

  canDeleteTache(): boolean {
    return this.authService.hasPermission('TACHE_DELETE');
  }

  canCreateTache(): boolean {
    return this.authService.hasPermission('TACHE_CREATE');
  }

  deleteTache(id: number): void {
    if (!this.canDeleteTache()) {
      this.errorMessage = 'Vous n\'avez pas les droits pour supprimer une tâche';
      return;
    }
    
    if (confirm('Supprimer cette tâche ?')) {
      this.utilisateurService.supprimerTache(id).subscribe({
        next: () => {
          this.taches = this.taches.filter(t => t.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          if (err.status === 403) {
            this.errorMessage = 'Vous n\'avez pas les droits pour supprimer cette tâche';
          }
        }
      });
    }
  }

  getTachesParUtilisateur(utilisateurId: number): void {
    this.utilisateurService.getTachesParUtilisateur(utilisateurId).subscribe({
      next: (data) => {
        this.taches = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // ✅ Méthode pour obtenir la classe CSS du type de tâche
  getTypeClass(type: string): string {
    if (!type) return 'other';
    const typeLower = type.toLowerCase();
    if (typeLower === 'reunion') return 'reunion';
    if (typeLower === 'evenement') return 'evenement';
    if (typeLower === 'audit') return 'audit';
    if (typeLower === 'inventaire') return 'inventaire';
    return 'custom';  // Pour les types personnalisés
  }

  // Tâches expirées
  get expiredTaches(): Tache[] {
    const now = new Date();
    return this.taches.filter(t => t.dateTache && new Date(t.dateTache) < now);
  }

  // Tâches à venir
  get upcomingTaches(): Tache[] {
    const now = new Date();
    return this.taches.filter(t => t.dateTache && new Date(t.dateTache) >= now);
  }
}