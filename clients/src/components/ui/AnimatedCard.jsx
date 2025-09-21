import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  ...props 
}) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}