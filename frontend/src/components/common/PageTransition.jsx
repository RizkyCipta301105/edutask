import React from 'react'
import { motion } from 'framer-motion'

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ x: 15, y: 15 }}
      animate={{ x: 0, y: 0 }}
      exit={{ x: -15, y: -15 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
