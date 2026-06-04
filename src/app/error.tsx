'use client'

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body>
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
          <h2>Erreur : {error.message}</h2>
          <a href="/">Retour accueil</a>
        </div>
      </body>
    </html>
  )
}
