import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const { register, authMode } = useAuth()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const handle = async (e)=>{
    e.preventDefault()
    try{ await register(email,password); alert('Registered') }catch(e){ alert('Register failed') }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Register</h2>
      {authMode === 'mock' && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Demo Mode is active. Create an account with any email and password.
        </div>
      )}
      <form onSubmit={handle} className="mt-4 space-y-3">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full input-themed" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full input-themed" />
        <button className="w-full btn-emerald">Register</button>
      </form>
    </div>
  )
}
