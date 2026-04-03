'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/providers/ThemeProvider'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function Button({ children, onClick, className = '', disabled = false }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </motion.button>
  )
}
