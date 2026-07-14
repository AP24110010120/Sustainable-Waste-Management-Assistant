export default function CategoryChip({category, icon}){
  const colorMap = {
    Organic: 'border-emerald-700/40 bg-emerald-500/15 text-emerald-200',
    Plastic: 'border-cyan-700/40 bg-cyan-500/15 text-cyan-200',
    Metal: 'border-slate-600/50 bg-slate-700/60 text-slate-200',
    Glass: 'border-amber-700/40 bg-amber-500/15 text-amber-200',
    Paper: 'border-lime-700/40 bg-lime-500/15 text-lime-200',
    Electronic: 'border-violet-700/40 bg-violet-500/15 text-violet-200',
    Hazardous: 'border-red-700/40 bg-red-500/15 text-red-200',
    Unknown: 'border-emerald-800/60 bg-emerald-900/30 text-emerald-100'
  }

  const cls = colorMap[category] || colorMap['Unknown']

  return (
    <span className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-sm ${cls}`}>
      {icon && <span className="text-lg">{icon}</span>}
      <span>{category}</span>
    </span>
  )
}
