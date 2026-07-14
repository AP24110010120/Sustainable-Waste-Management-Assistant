import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login, authMode } = useAuth()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const handle = async (e)=>{
    e.preventDefault()
    try{ await login(email,password); alert('Logged in') }catch(e){ alert('Login failed') }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Login</h2>
      {authMode === 'mock' && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Demo Mode is active. Use any email and password to continue.
        </div>
      )}
      <form onSubmit={handle} className="mt-4 space-y-3">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded" />
        <button className="w-full bg-brand text-white p-2 rounded">Login</button>
      </form>
    </div>
  )
}
