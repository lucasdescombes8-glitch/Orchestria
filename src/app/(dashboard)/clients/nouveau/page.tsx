import { getTypesPrestataire } from '@/actions/types-prestataire'
import { NouveauClientForm } from './nouveau-form'

export default async function NouveauClientPage() {
  const typesPrestataire = await getTypesPrestataire()
  return <NouveauClientForm typesPrestataire={typesPrestataire} />
}
