import { HistoriqueAction } from "./historique-action.model";
import { Role } from "./role.model";

export interface Utilisateur {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    motDePasse?: string;
    numTelephone?: string;
    role?: Role;
    historiques?: HistoriqueAction[];
}