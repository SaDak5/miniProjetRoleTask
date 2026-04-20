import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './service/authService.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit {

  nomUtilisateur: string = '';
  prenomUtilisateur: string = '';
  estConnecte: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Écouter les changements de login/logout
    this.authService.isLoggedIn$.subscribe(status => {
      this.estConnecte = status;
      if (status) {
        this.chargerUtilisateur();
      } else {
        this.nomUtilisateur = '';
        this.prenomUtilisateur = '';
      }
    });
  }

  chargerUtilisateur() {
    if (this.authService.isLoggedIn()) {
      this.nomUtilisateur = this.authService.getNom();
      this.prenomUtilisateur = this.authService.getPrenom();
    }
  }

  logout() {
    console.log('🔓 Déconnexion - vidage du localStorage');
    this.authService.logout();
    this.estConnecte = false;
    this.nomUtilisateur = '';
    this.prenomUtilisateur = '';
    this.router.navigate(['/login']);
  }
}