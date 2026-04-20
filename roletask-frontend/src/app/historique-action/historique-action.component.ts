import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // ← Ajouter
import { HistoriqueAction } from '../models/historique-action.model';
import { UtilisateurService } from '../service/utilisateur.service';
import { AuthService } from '../service/authService.service';


@Component({
  selector: 'app-historique-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historique-action.component.html'
})
export class HistoriqueActionComponent implements OnInit {

  historiques: HistoriqueAction[] = [];

  constructor(
    private service: UtilisateurService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService,   // ← Ajouter
    private router: Router               // ← Ajouter
  ) {}

  ngOnInit(): void {
    // ✅ Vérifier que l'utilisateur a le droit de lire l'historique
    if (!this.authService.hasPermission('HISTORIQUE_READ')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    this.loadHistorique();
  }

  loadHistorique() {
    this.service.listeHistoriques().subscribe({
      next: (data) => {
        // plus récent en premier
        this.historiques = [...data].reverse();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur historiques :', err);
        // ✅ Rediriger si erreur 403 (non autorisé)
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        }
      }
    });
  }

  // ← corrigé pour correspondre aux vrais messages Spring Boot
  getType(action: string): string {
    if (!action) return 'other';
    const a = action.toLowerCase();
    if (a.includes('création') || a.includes('creation') || a.includes('ajout')) 
      return 'create';
    if (a.includes('modification') || a.includes('modifi')) 
      return 'update';
    if (a.includes('suppression') || a.includes('supprim') || a.includes('retrait')) 
      return 'delete';
    return 'other';
  }

  getTypeLabel(action: string): string {
    const type = this.getType(action);
    switch (type) {
      case 'create': return 'Création';
      case 'update': return 'Modification';
      case 'delete': return 'Suppression';
      default: return 'Autre';
    }
  }
}