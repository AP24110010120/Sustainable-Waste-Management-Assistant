import { useEffect, useMemo, useState } from 'react'
import API from '../services/api'
import CategoryChip from '../components/CategoryChip'

export default function History(){
  const [history, setHistory] = useState([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    fetchHistory()
  },[])

  const fetchHistory = async ()=>{
    setLoading(true)
    setError(null)

    try{
      const res = await API.get('/api/get-history?userId=test-user')
      setHistory(res.data.history || [])
    }catch(e){
      console.error(e)
      setHistory([])
    }finally{
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const set = new Set()
    history.forEach((entry) => {
      const category = entry.category || entry.categoryName || 'Unknown'
      if (category) set.add(category)
    })
    return Array.from(set)
  }, [history])

  const filtered = useMemo(() => {
    return history.filter((entry) => {
      const name = String(entry.item || entry.waste || '').toLowerCase()
      const searchMatch = name.includes(query.toLowerCase())
      const categoryMatch = categoryFilter
        ? String(entry.category || entry.categoryName || '').toLowerCase() === categoryFilter.toLowerCase()
        : true
      return searchMatch && categoryMatch
    })
  }, [history, query, categoryFilter])

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-emerald-50">Scan History</h1>
            <p className="mt-2 text-sm text-emerald-100/80">
              Review your recent waste scans with category tags, recyclability, and hazard status.
            </p>
          </div>

          <div className="w-full max-w-md">
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className="w-full rounded-3xl border border-emerald-800/70 bg-[#071b12] px-4 py-3 text-sm text-emerald-50 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Search scan history"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={()=>setCategoryFilter('')}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${!categoryFilter ? 'bg-brand text-white border-brand' : 'bg-white text-slate-700 border-slate-300 hover:border-brand hover:text-brand dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'}`}
            >
              All categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={()=>setCategoryFilter(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${categoryFilter === cat ? 'bg-brand text-white border-brand' : 'bg-white text-slate-700 border-slate-300 hover:border-brand hover:text-brand dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Loading scan history…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
              <div className="text-lg font-medium text-slate-900 dark:text-white">No history found</div>
              <p className="mt-2">Try a different search term or scan a new item to build history.</p>
            </div>
          ) : (
            filtered.map((entry, index) => {
              const itemName = entry.item || entry.waste || 'Unknown item'
              const category = entry.category || entry.categoryName || 'Unknown'
              const formattedDate = entry.formattedDate || entry.date || entry.scannedAt || 'Unknown date'
              const recyclable = entry.recyclable == null ? entry.isRecyclable : entry.recyclable
              const hazardous = entry.hazardous == null ? entry.isHazardous : entry.hazardous
              const disposal = entry.fullResponse?.disposal || entry.disposal || 'No disposal notes available.'

              return (
                <div key={`${itemName}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{itemName}</div>
                        <CategoryChip category={category} icon={entry.categoryIcon || entry.icon} />
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{formattedDate}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {recyclable ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                          Recyclable
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          Not recyclable
                        </span>
                      )}
                      {hazardous ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                          Hazardous
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          Non-hazardous
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_250px]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {disposal}
                    </div>
                    <div className="space-y-3">
                      {entry.notes && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          <div className="font-semibold text-slate-900 dark:text-white">Notes</div>
                          <p className="mt-2">{entry.notes}</p>
                        </div>
                      )}
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        <div className="font-semibold text-slate-900 dark:text-white">Category</div>
                        <p className="mt-2">{category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
