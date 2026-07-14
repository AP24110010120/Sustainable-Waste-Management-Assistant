import { useState } from 'react'
import API from '../services/api'
import ResultCard from '../components/ResultCard'

const QUICK_ITEMS = [
  'Plastic Bottle',
  'Battery',
  'Glass Jar',
  'Aluminium Can',
  'Paper Cup',
  'Electronic Device',
  'Food Waste',
  'Light Bulb',
  'Oil Container',
  'Paint Can',
  'Cardboard',
  'Styrofoam'
]

export default function Home(){
  const [item, setItem] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const scanItem = async (value) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Please enter a waste item to scan.')
      return
    }

    setError(null)
    setLoading(true)
    setAnalysis(null)

    try {
      const res = await API.post('/scan', { item: trimmed })
      if (res.data?.success && res.data.analysis) {
        setAnalysis(res.data.analysis)
      } else if (res.data?.success && res.data.guide) {
        setAnalysis({ guide: res.data.guide })
      } else if (res.data?.error) {
        setError(res.data.error)
      } else {
        setError('No guidance returned. Please try a different item.')
      }
    } catch (e) {
      setError('Unable to reach the backend. Please check that the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    await scanItem(item)
  }

  const handleQuick = async (value) => {
    setItem(value)
    await scanItem(value)
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      await scanItem(item)
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-[28px] border border-emerald-900/70 bg-[#0b1f16]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-8">
        <h1 className="text-3xl font-bold text-emerald-50">Waste Scanner</h1>
        <p className="mt-2 text-emerald-100/80">Get AI-powered disposal guidance</p>

        <div className="mt-6 grid gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={item}
              onChange={(e)=>setItem(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-2xl border border-emerald-800/70 bg-[#071b12] p-3 text-emerald-50 placeholder:text-emerald-100/50 focus:border-emerald-500 focus:outline-none"
              placeholder="Example: Plastic Bottle"
            />
            <button
              onClick={handleScan}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-[#05140d] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Scanning...
                </>
              ) : 'Scan'}
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-700/50 bg-red-500/10 p-3 text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_ITEMS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuick(q)}
                className="rounded-2xl border border-emerald-800/70 bg-[#0f2d1f] px-3 py-2 text-left text-sm text-emerald-100 transition hover:border-emerald-500 hover:bg-[#153b28]"
              >
                {q}
              </button>
            ))}
          </div>

          {analysis && <ResultCard analysis={analysis} />}
        </div>
      </div>
    </div>
  )
}
