import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { HistoriqueAction } from '../models/historique-action.model';
import { Tache } from '../models/tache.model';
import { Utilisateur } from '../models/utilisateur.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private readonly apiUtilisateurs: string;
  private readonly apiRoles: string;
  private readonly apiPermissions: string;
  private readonly apiHistoriques: string;
  private readonly apiTaches: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    const apiBaseUrl = this.apiConfigService.getApiBaseUrl();
    this.apiUtilisateurs = `${apiBaseUrl}/utilisateurs`;
    this.apiRoles = `${apiBaseUrl}/roles`;
    this.apiPermissions = `${apiBaseUrl}/permissions`;
    this.apiHistoriques = `${apiBaseUrl}/historiques`;
    this.apiTaches = `${apiBaseUrl}/taches`;
  }

  // ======================================================
  // UTILISATEURS
  // ======================================================
  listeUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUtilisateurs);
  }

  consulterUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUtilisateurs}/${id}`);
  }

  getUtilisateurParEmail(email: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUtilisateurs}/email/${email}`);
  }

  ajouterUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUtilisateurs, utilisateur);
  }

  modifierUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUtilisateurs}/${id}`, utilisateur);
  }

  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUtilisateurs}/${id}`);
  }

   getUtilisateurParNom(nom: string): Observable<Utilisateur[]> {
  return this.http.get<Utilisateur[]>(`${this.apiUtilisateurs}/nom/${nom}`);
}

  getPermissionsUtilisateur(id: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUtilisateurs}/${id}/permissions`);
  }


  

  // ======================================================
  // ROLES
  // ======================================================
  listeRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiRoles);
  }

  consulterRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiRoles}/${id}`);
  }

  consulterRoleParNom(nom: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiRoles}/nom/${nom}`);
  }

  // ← simple appel HTTP, Spring Boot gère l'historique
  ajouterRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiRoles, role);
  }

  modifierRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiRoles}/${id}`, role);
  }

  supprimerRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRoles}/${id}`);
  }

  ajouterPermissionARole(roleId: number, permissionId: number): Observable<Role> {
    return this.http.post<Role>(
      `${this.apiRoles}/${roleId}/permissions/${permissionId}`, {});
  }

  retirerPermissionDeRole(roleId: number, permissionId: number): Observable<Role> {
    return this.http.delete<Role>(
      `${this.apiRoles}/${roleId}/permissions/${permissionId}`);
  }

  // ======================================================
  // PERMISSIONS
  // ======================================================
  listePermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiPermissions);
  }

  consulterPermission(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiPermissions}/${id}`);
  }

  consulterPermissionParNom(nom: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiPermissions}/nom/${nom}`);
  }

  ajouterPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiPermissions, permission);
  }

  modifierPermission(id: number, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiPermissions}/${id}`, permission);
  }

  supprimerPermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiPermissions}/${id}`);
  }

  // ======================================================
  // HISTORIQUE ACTIONS
  // ======================================================
  listeHistoriques(): Observable<HistoriqueAction[]> {
    return this.http.get<HistoriqueAction[]>(this.apiHistoriques);
  }

  consulterHistorique(id: number): Observable<HistoriqueAction> {
    return this.http.get<HistoriqueAction>(`${this.apiHistoriques}/${id}`);
  }

  getHistoriqueParUtilisateur(utilisateurId: number): Observable<HistoriqueAction[]> {
    return this.http.get<HistoriqueAction[]>(
      `${this.apiHistoriques}/utilisateur/${utilisateurId}`);
  }

  ajouterHistorique(action: HistoriqueAction): Observable<HistoriqueAction> {
    return this.http.post<HistoriqueAction>(this.apiHistoriques, action);
  }

  supprimerHistorique(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiHistoriques}/${id}`);
  }

  // ======================================================
  // TACHES
  // ======================================================
  listeTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.apiTaches);
  }

  consulterTache(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiTaches}/${id}`);
  }

  getTachesParType(type: string): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiTaches}/type/${type}`);
  }

  getTachesParUtilisateur(utilisateurId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiTaches}/utilisateur/${utilisateurId}`);
  }

  getTachesParDate(date: string): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiTaches}/date/${date}`);
  }

  getTachesEntreDates(debut: string, fin: string): Observable<Tache[]> {
    return this.http.get<Tache[]>(
      `${this.apiTaches}/periode?debut=${debut}&fin=${fin}`);
  }

  ajouterTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(this.apiTaches, tache);
  }

  modifierTache(id: number, tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiTaches}/${id}`, tache);
  }

  supprimerTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiTaches}/${id}`);
  }
}