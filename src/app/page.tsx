'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-2 border-current border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
          >
            <h1 className="text-5xl font-bold tracking-tight">Exotic</h1>
            <p className="text-xl opacity-70">Welcome back. Your social network awaits.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
          >
            <h1 className="text-5xl font-bold tracking-tight">Exotic</h1>
            <p className="text-lg opacity-70 max-w-md">The modern social network experience. Sign in to get started.</p>
            <a href="/login" className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
              Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
