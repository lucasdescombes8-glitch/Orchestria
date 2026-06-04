'use client'

export default function DashboardError({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-red-500 text-5xl">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-800">Une erreur est survenue</h2>
      <pre className="text-sm text-red-600 bg-red-50 p-4 rounded-lg max-w-2xl overflow-auto">
        {error.message}
      </pre>
      <a href="/" className="text-indigo-600 underline">Recharger</a>
    </div>
  )
}
