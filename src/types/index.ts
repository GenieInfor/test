export interface Client {
  id: number
  nom: string
  prenom: string
  telephone: string
  ville: string
  quartier: string
  est_actif: boolean
  created_at: string
}

export interface Admin {
  id: number
  nom: string
  telephone: string
}

export interface Categorie {
  id: number
  nom: string
  description: string
  image_url: string | null
  est_active: boolean
  created_at: string
}

export interface Produit {
  id: number
  nom: string
  description: string
  prix: number
  prix_promo: number | null
  stock: number
  image_url: string | null
  categorie_id: number | null
  categorie_nom?: string
  est_actif: boolean | number
  est_vedette: boolean | number
  created_at: string
}

export interface ProduitImage {
  id: number
  produit_id: number
  image_url: string
  ordre: number
}

export interface Avis {
  id: number
  produit_id: number
  client_id: number | null
  nom_auteur: string
  note: number
  commentaire: string | null
  created_at: string
}

export interface LigneCommande {
  id: number
  commande_id: number
  produit_id: number | null
  nom_produit: string
  prix_unitaire: number
  quantite: number
  sous_total: number
}

export interface Commande {
  id: number
  numero_commande: string
  client_id: number | null
  nom_invite?: string
  prenom_invite?: string
  telephone_invite?: string
  quartier_invite?: string
  statut: 'en_attente' | 'validée' | 'annulée'
  montant_total: number
  notes?: string
  created_at: string
  updated_at: string
  nom?: string
  prenom?: string
  telephone?: string
  quartier?: string
  type_client?: 'inscrit' | 'invité'
  lignes?: LigneCommande[]
  historique?: StatutHistorique[]
}

export interface StatutHistorique {
  id: number
  commande_id: number
  statut: string
  note: string | null
  created_at: string
}

export interface CartItem {
  produit: Produit
  quantite: number
}

export interface CodePromo {
  id: number
  code: string
  type: 'pourcentage' | 'fixe'
  valeur: number
  usage_max: number
  usage_count: number
  date_expiration: string | null
  est_actif: boolean | number
  created_at: string
}

export interface Notification {
  id: number
  type: string
  titre: string
  message: string | null
  lue: boolean | number
  data: string | null
  created_at: string
}

export interface StatsHebdo {
  semaine: string
  debut: string
  commandes: number
  chiffre: number
}

export interface StatsMensuelles {
  periode: string
  label: string
  commandes: number
  chiffre: number
}
