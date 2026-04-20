import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../service/utilisateur.service';
import { Permission } from '../models/permission.model';

@Component({
  selector: 'app-update-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-permission.component.html'
})
export class UpdatePermissionComponent implements OnInit {

  permission!: Permission;
  erreur: string = '';
  succes: string = '';
  chargement: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.utilisateurService.consulterPermission(id).subscribe({
      next: (data) => {
        this.permission = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Permission introuvable.';
        this.cdr.detectChanges();
      }
    });
  }

  confirmer() {
    if (!this.permission.nom?.trim()) {
      this.erreur = 'Le nom de la permission est obligatoire.';
      return;
    }

    this.chargement = true;
    this.erreur = '';

    this.utilisateurService.modifierPermission(this.permission.id!, this.permission).subscribe({
      next: () => {
        this.succes = 'Permission modifiée avec succès !';
        this.chargement = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/permissions']), 1000);
      },
      error: () => {
        this.erreur = 'Erreur lors de la modification.';
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  annuler() {
    this.router.navigate(['/permissions']);
  }
} 