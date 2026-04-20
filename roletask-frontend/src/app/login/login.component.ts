import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/authService.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  motDePasse: string = '';
  erreur: string = '';
  chargement: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email.trim() || !this.motDePasse.trim()) {
      this.erreur = 'Email et mot de passe sont obligatoires.';
      return;
    }

    this.chargement = true;
    this.erreur = '';

    // Utiliser AuthService.login() plutôt que HttpClient directement
    this.authService.login(this.email, this.motDePasse).subscribe({
      next: (response) => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ UTILISATEUR CONNECTÉ AVEC SUCCÈS');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 INFORMATIONS PERSONNELLES :');
        console.log('   ├─ Nom complet   :', response.prenom, response.nom);
        console.log('   ├─ Email        :', response.email);
        console.log('   └─ Téléphone    :', response.numTelephone || 'Non renseigné');
        console.log('───────────────────────────────────────────────────────');
        console.log('🔐 SÉCURITÉ :');
        console.log('   └─ Token JWT    :', response.token?.substring(0, 50) + '...');
        console.log('───────────────────────────────────────────────────────');
        console.log('👥 RÔLES :');
        response.roles?.forEach((role: string, index: number) => {
          console.log(`   ${index === response.roles.length - 1 ? '└─' : '├─'} ${role}`);
        });
        console.log('───────────────────────────────────────────────────────');
        console.log('🔑 PERMISSIONS (' + (response.permissions?.length || 0) + ') :');
        response.permissions?.forEach((perm: string, index: number) => {
          const isLast = index === response.permissions.length - 1;
          console.log(`   ${isLast ? '└─' : '├─'} ${perm}`);
        });
        console.log('═══════════════════════════════════════════════════════');

        this.chargement = false;

        // Navigation Angular propre — pas de window.location.href
        this.router.navigate(['/taches']);
      },
      error: (err) => {
        this.erreur = err.error?.error || 'Email ou mot de passe incorrect.';
        this.chargement = false;
        console.error('❌ ERREUR DE CONNEXION :', this.erreur);
      }
    });
  }
}