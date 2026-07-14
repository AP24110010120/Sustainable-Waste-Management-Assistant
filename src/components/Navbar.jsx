import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/map', label: 'Map' },
  { path: '/history', label: 'History' },
  { path: '/dashboard', label: 'Dashboard' }
]

const activeClass = 'text-emerald-300 font-semibold border-b-2 border-emerald-400'
const inactiveClass = 'text-emerald-100/80 hover:text-emerald-300 transition-colors duration-150'

export default function Navbar(){
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/70 bg-[#071b12]/95 backdrop-blur shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold tracking-tight text-emerald-100">WasteGuide AI</div>
            <span className="inline-flex items-center rounded-full border border-emerald-700/70 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Demo Mode
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${isActive ? activeClass : inactiveClass} px-2 py-1 rounded-md`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-800 bg-[#0e2f21] text-emerald-200 shadow-sm transition hover:bg-[#153b28] focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      <div className={`md:hidden ${open ? 'block' : 'hidden'} border-t border-emerald-900/70 bg-[#071b12]`}>
        <div className="space-y-1 px-4 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-base font-medium transition ${isActive ? 'bg-emerald-500/15 text-emerald-300' : 'text-emerald-100/80 hover:bg-emerald-900/40'}`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}
