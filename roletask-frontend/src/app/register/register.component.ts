import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../service/api-config.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nom: string = '';
  prenom: string = '';
  email: string = '';
  motDePasse: string = '';
  numTelephone: string = '';
  erreur: string = '';
  succes: string = '';
  chargement: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private apiConfigService: ApiConfigService
  ) {}

  register() {
    if (!this.nom.trim() || !this.prenom.trim() ||
        !this.email.trim() || !this.motDePasse.trim()) {
      this.erreur = 'Tous les champs obligatoires doivent être remplis.';
      return;
    }

    this.chargement = true;
    this.erreur = '';
    this.succes = '';

    const body = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      motDePasse: this.motDePasse,
      numTelephone: this.numTelephone
      // ← pas de role envoyé, le backend gère EMPLOYEE par défaut
    };

    this.http.post<any>(`${this.apiConfigService.getApiBaseUrl()}/auth/register`, body).subscribe({
      next: () => {
        this.succes = 'Compte créé avec succès ! Redirection...';
        this.chargement = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.erreur = err.error?.error || 'Erreur lors de la création du compte.';
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }
}