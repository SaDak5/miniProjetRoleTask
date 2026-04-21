import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl: string;


  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${this.apiConfigService.getApiBaseUrl()}/auth`;
  }

  login(email: string, motDePasse: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, motDePasse }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.email);
        localStorage.setItem('nom', response.nom);
        localStorage.setItem('prenom', response.prenom);
        localStorage.setItem('roles', JSON.stringify(response.roles));
        localStorage.setItem('permissions', JSON.stringify(response.permissions));
        this.loggedIn.next(true);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  getNom(): string {
    return localStorage.getItem('nom') || '';
  }

  getPrenom(): string {
    return localStorage.getItem('prenom') || '';
  }

  getRoles(): string[] {
    return JSON.parse(localStorage.getItem('roles') || '[]');
  }

  getPermissions(): string[] {
    return JSON.parse(localStorage.getItem('permissions') || '[]');
  }

  isAdmin(): boolean {
    const roles = this.getRoles();
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }

  isManager(): boolean {
    const roles = this.getRoles();
    return roles.includes('MANAGER') || roles.includes('ROLE_MANAGER');
  }

  isEmployee(): boolean {
    const roles = this.getRoles();
    return roles.includes('EMPLOYEE') || roles.includes('ROLE_EMPLOYEE');
  }

  isAdminOrManager(): boolean {
    return this.isAdmin() || this.isManager();
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }
}