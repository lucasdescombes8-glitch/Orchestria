import { Badge } from '@/components/ui/badge'

type StatutEvenement = 'OPPORTUNITE' | 'OPTION' | 'CONFIRME' | 'FACTURE' | 'ANNULE'
type StatutDevis = 'BROUILLON' | 'ENVOYE' | 'VU' | 'ACCEPTE' | 'REFUSE' | 'EXPIRE'
type StatutFacture = 'BROUILLON' | 'EMISE' | 'ENVOYEE' | 'PAYEE' | 'RETARD' | 'ANNULEE'
type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
type PrioriteTask = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'

const evenementLabels: Record<string, string> = {
  OPPORTUNITE: 'Opportunité',
  OPTION: 'Option',
  CONFIRME: 'Confirmé',
  FACTURE: 'Facturé',
  ANNULE: 'Annulé',
}

const evenementVariants: Record<string, string> = {
  OPPORTUNITE: 'secondary',
  OPTION: 'info',
  CONFIRME: 'success',
  FACTURE: 'warning',
  ANNULE: 'destructive',
}

const devisLabels: Record<StatutDevis, string> = {
  BROUILLON: 'Brouillon',
  ENVOYE: 'Envoyé',
  VU: 'Vu',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé',
  EXPIRE: 'Expiré',
}

const devisVariants: Record<StatutDevis, string> = {
  BROUILLON: 'secondary',
  ENVOYE: 'info',
  VU: 'warning',
  ACCEPTE: 'success',
  REFUSE: 'destructive',
  EXPIRE: 'outline',
}

const factureLabels: Record<StatutFacture, string> = {
  BROUILLON: 'Brouillon',
  EMISE: 'Émise',
  ENVOYEE: 'Envoyée',
  PAYEE: 'Payée',
  RETARD: 'En retard',
  ANNULEE: 'Annulée',
}

const factureVariants: Record<StatutFacture, string> = {
  BROUILLON: 'secondary',
  EMISE: 'info',
  ENVOYEE: 'warning',
  PAYEE: 'success',
  RETARD: 'destructive',
  ANNULEE: 'outline',
}

const tacheLabels: Record<StatutTache, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
}

const tacheVariants: Record<StatutTache, string> = {
  A_FAIRE: 'secondary',
  EN_COURS: 'info',
  TERMINEE: 'success',
  ANNULEE: 'outline',
}

const prioriteLabels: Record<PrioriteTask, string> = {
  BASSE: 'Basse',
  NORMALE: 'Normale',
  HAUTE: 'Haute',
  URGENTE: 'Urgente',
}

const prioriteVariants: Record<PrioriteTask, string> = {
  BASSE: 'secondary',
  NORMALE: 'info',
  HAUTE: 'warning',
  URGENTE: 'destructive',
}

export function StatutEvenementBadge({ statut }: { statut: string }) {
  return (
    <Badge variant={evenementVariants[statut] as any}>
      {evenementLabels[statut]}
    </Badge>
  )
}

export function StatutDevisBadge({ statut }: { statut: StatutDevis }) {
  return (
    <Badge variant={devisVariants[statut] as any}>
      {devisLabels[statut]}
    </Badge>
  )
}

export function StatutFactureBadge({ statut }: { statut: StatutFacture }) {
  return (
    <Badge variant={factureVariants[statut] as any}>
      {factureLabels[statut]}
    </Badge>
  )
}

export function StatutTacheBadge({ statut }: { statut: StatutTache }) {
  return (
    <Badge variant={tacheVariants[statut] as any}>
      {tacheLabels[statut]}
    </Badge>
  )
}

export function PrioriteBadge({ priorite }: { priorite: PrioriteTask }) {
  return (
    <Badge variant={prioriteVariants[priorite] as any}>
      {prioriteLabels[priorite]}
    </Badge>
  )
}
