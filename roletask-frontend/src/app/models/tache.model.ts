import { Utilisateur } from "./utilisateur.model";

export interface Tache {
  id?: number;
  nomDuTache: string;
  typeTache: string;  
  dateTache: string;
  periodeTache: number;
  utilisateur?: Utilisateur;
}

export const typesTachePredifinis = ['REUNION', 'EVENEMENT', 'AUDIT', 'INVENTAIRE'];