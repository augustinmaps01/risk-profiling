import React from 'react';
import { motion } from 'framer-motion';

export default function StepIndicator({ steps, currentStep, current, total, className = '' }) {
  // Handle both prop formats for backward compatibility
  const stepArray = steps || Array.from({ length: total + 1 }, (_, i) => ({ id: i, name: `Step ${i + 1}` }));
  const activeStep = currentStep !== undefined ? currentStep : current;

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {stepArray.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const isUpcoming = index > activeStep;

        return (
          <div key={index} className="flex items-center">
            <motion.div
              className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                  : 'bg-slate-200 text-slate-500'
              }`}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>

            {index < stepArray.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}