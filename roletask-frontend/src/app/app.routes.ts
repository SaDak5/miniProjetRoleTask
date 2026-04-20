// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { RolesComponent } from './roles/roles.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { AddRoleComponent } from './add-role/add-role.component';
//import { AddPermissionComponent } from './add-permission/add-permission.component';

import { AddTacheComponent } from './add-tache/add-tache.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TachesComponent } from './taches/taches.component';
import { UpdateTacheComponent } from './update-tache/update-tache.component';
import { UpdateRoleComponent } from './update-role/update-role.component';
import { HistoriqueActionComponent } from './historique-action/historique-action.component';
import { UpdateUtilisateurComponent } from './update-utilisateur/update-utilisateur.component';
import { GestionUtilisateursComponent } from './gestion-utilisateurs/gestion-utilisateurs.component';
import { AddPermissionComponent } from './add-permission/add-permission.component';
import { UpdatePermissionComponent } from './update-permission/update-permission.component';





// Importer les composants (ajustez les chemins selon votre structure)


export const routes: Routes = [
  
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'add-role', component: AddRoleComponent },
  { path: 'permissions', component: PermissionsComponent },
  { path: 'add-permission', component: AddPermissionComponent },
  { path: 'taches', component: TachesComponent },
  { path: 'add-tache', component: AddTacheComponent },
  { path: 'update-tache/:id', component: UpdateTacheComponent },
  { path: 'update-role/:id', component: UpdateRoleComponent},
  { path: 'historiques', component: HistoriqueActionComponent},
  { path: 'utilisateurs', component: GestionUtilisateursComponent },
  { path: 'update-utilisateur/:id', component:  UpdateUtilisateurComponent},
  { path: 'update-permission/:id', component:  UpdatePermissionComponent}

];
