 import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Permission } from '../models/permission.model';

@Component({
  selector: 'app-add-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-permission.component.html'
})
export class AddPermissionComponent {
  permission: Permission = { nom: '', description: '' };
  erreur: string = '';
  succes: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  sauvegarder() {
    if (!this.permission.nom.trim()) {
      this.erreur = 'Le nom de la permission est obligatoire.';
      return;
    }

    this.utilisateurService.ajouterPermission(this.permission).subscribe({
      next: () => {
        this.succes = 'Permission créée avec succès.';
        setTimeout(() => this.router.navigate(['/permissions']), 1000);
      },
      error: (err) => {
        this.erreur = 'Erreur lors de la création de la permission.';
        console.error(err);
      }
    });
  }

  annuler() {
    this.router.navigate(['/permissions']);
  }
} 