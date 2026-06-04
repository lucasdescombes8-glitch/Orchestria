'use client'

import dynamic from 'next/dynamic'

const Chart = dynamic(
  () => import('recharts').then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod
    function ChartInner({ data }: { data: Array<{ mois: string; ca: number }> }) {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, 'CA']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="ca" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    return { default: ChartInner }
  }),
  { ssr: false, loading: () => <div className="h-60 flex items-center justify-center text-gray-400 text-sm">Chargement du graphique...</div> }
)

interface CaChartProps {
  data: Array<{ mois: string; ca: number }>
}

export function CaChart({ data }: CaChartProps) {
  return <Chart data={data} />
}
