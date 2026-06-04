import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const siret = request.nextUrl.searchParams.get('siret')

  if (!siret || siret.length !== 14) {
    return NextResponse.json({ error: 'SIRET invalide (14 chiffres requis)' }, { status: 400 })
  }

  const apiToken = process.env.PAPPERS_API_KEY
  if (!apiToken) {
    return NextResponse.json({ error: 'Clé API Pappers non configurée' }, { status: 503 })
  }

  const res = await fetch(
    `https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${apiToken}`,
    { next: { revalidate: 86400 } } // cache 24h
  )

  if (!res.ok) {
    if (res.status === 404) return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 })
    return NextResponse.json({ error: 'Erreur Pappers' }, { status: res.status })
  }

  const data = await res.json()

  return NextResponse.json({
    raisonSociale: data.nom_entreprise ?? '',
    siret: data.siret ?? siret,
    formeJuridique: data.forme_juridique ?? '',
    adresse: data.siege?.adresse_ligne_1 ?? '',
    codePostal: data.siege?.code_postal ?? '',
    ville: data.siege?.ville ?? '',
    secteur: data.libelle_code_naf ?? '',
    email: data.email ?? '',
    telephone: data.telephone ?? '',
  })
}
