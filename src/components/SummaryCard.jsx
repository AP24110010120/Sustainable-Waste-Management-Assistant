export default function SummaryCard({title, value, change}){
  return (
    <div className="rounded-3xl border border-emerald-900/60 bg-[#0b1f16] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
      <div className="text-sm text-emerald-200/80">{title}</div>
      <div className="mt-2 text-2xl font-bold text-emerald-50">{value}</div>
      {change && <div className="mt-1 text-sm text-emerald-300">{change}</div>}
    </div>
  )
}
