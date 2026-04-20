import { Utilisateur } from './utilisateur.model';

export interface HistoriqueAction {
  id?: number;
  action: string;
  date?: string;
  utilisateur?: Utilisateur;
}