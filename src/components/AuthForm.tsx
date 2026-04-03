'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (mode === 'login') {
      await supabase.auth.signInWithPassword({ email, password })
    } else {
      await supabase.auth.signUp({ email, password })
    }
    
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6"
    >
      <h1 className="text-3xl font-bold text-center mb-8">Exotic</h1>
      
      <div className="flex border border-current rounded-full p-1 mb-6">
        <button 
          onClick={() => setMode('login')} 
          className={`flex-1 py-2 rounded-full transition-colors ${mode === 'login' ? 'bg-black dark:bg-white text-white dark:text-black' : ''}`}
        >
          Login
        </button>
        <button 
          onClick={() => setMode('register')} 
          className={`flex-1 py-2 rounded-full transition-colors ${mode === 'register' ? 'bg-black dark:bg-white text-white dark:text-black' : ''}`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-current rounded-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-current rounded-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </motion.div>
  )
}
