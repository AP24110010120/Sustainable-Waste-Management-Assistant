import { useEffect, useMemo, useState } from 'react'
import API from '../services/api'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import SummaryCard from '../components/SummaryCard'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

const safeNumber = (value) => (typeof value === 'number' ? value : 0)

export default function Dashboard(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{ fetchData() },[])

  const fetchData = async ()=>{
    setLoading(true)
    setError(null)

    try{
      const res = await API.get('/api/dashboard-data?userId=test-user')
      setData(res.data.data || {})
    }catch(e){
      console.error(e)
      setData({})
    }finally{
      setLoading(false)
    }
  }

  const categoryCounts = useMemo(() => data?.categoryCounts || [], [data])
  const totalScans = safeNumber(data?.totalScans)
  const recyclableCount = safeNumber(data?.recyclableCount)
  const hazardousCount = safeNumber(data?.hazardousCount)
  const recyclePercentage = safeNumber(data?.recyclePercentage)

  const doughnutData = useMemo(() => ({
    labels: categoryCounts.map((item) => item.label || 'Unknown'),
    datasets: [
      {
        data: categoryCounts.map((item) => safeNumber(item.value)),
        backgroundColor: ['#60A5FA', '#F97316', '#34D399', '#F472B6', '#A78BFA', '#FBBF24'],
        borderWidth: 0
      }
    ]
  }), [categoryCounts])

  const barData = useMemo(() => ({
    labels: categoryCounts.map((item) => item.label || 'Unknown'),
    datasets: [
      {
        label: 'Scans by category',
        data: categoryCounts.map((item) => safeNumber(item.value)),
        backgroundColor: '#60A5FA'
      }
    ]
  }), [categoryCounts])

  const trend = data?.sevenDayTrend || {}
  const lineData = useMemo(() => ({
    labels: Array.isArray(trend.labels) ? trend.labels : [],
    datasets: Array.isArray(trend.datasets) && trend.datasets.length > 0
      ? trend.datasets.map((set) => ({
          ...set,
          borderColor: set.borderColor || '#22C55E',
          backgroundColor: set.backgroundColor || 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }))
      : []
  }), [trend])

  const hasChartData = categoryCounts.length > 0 || lineData.labels.length > 0

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-emerald-50">Dashboard</h1>
            <p className="mt-2 text-sm text-emerald-100/80">
              Monitor your waste scan performance with charts and summary metrics.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total Scans" value={loading ? '—' : totalScans} />
          <SummaryCard title="Recyclable" value={loading ? '—' : recyclableCount} />
          <SummaryCard title="Hazardous" value={loading ? '—' : hazardousCount} />
          <SummaryCard title="Recycle %" value={loading ? '—' : `${recyclePercentage}%`} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-1 rounded-3xl border border-emerald-900/60 bg-[#0b1f16] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Category share</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Doughnut</span>
            </div>
            <div className="mt-4 min-h-[320px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Loading chart…</div>
              ) : categoryCounts.length > 0 ? (
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No category data available.</div>
              )}
            </div>
          </section>

          <section className="lg:col-span-2 grid gap-4">
            <div className="rounded-3xl border border-emerald-900/60 bg-[#0b1f16] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-emerald-50">Weekly trend</h2>
                <span className="text-sm text-emerald-200/70">Line chart</span>
              </div>
              <div className="mt-4 min-h-[320px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Loading trend…</div>
                ) : lineData.labels.length > 0 && lineData.datasets.length > 0 ? (
                  <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.15)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.15)' }, beginAtZero: true } } }} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No trend data available.</div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/60 bg-[#0b1f16] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-emerald-50">Category volume</h2>
                <span className="text-sm text-emerald-200/70">Bar chart</span>
              </div>
              <div className="mt-4 min-h-[320px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Loading volume…</div>
                ) : categoryCounts.length > 0 ? (
                  <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#64748b' }, grid: { display: false } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.15)' }, beginAtZero: true } } }} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No volume data available.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
