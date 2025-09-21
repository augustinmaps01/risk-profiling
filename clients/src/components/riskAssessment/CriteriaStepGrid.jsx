import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../ui';
import { getGridLayoutClasses } from '../../utils/gridLayoutUtils.jsx';

const CriteriaStepGrid = ({ criteria, responses, handleSelect, error, currentStep }) => {
  const currentCriteria = criteria[currentStep - 1];
  const options = currentCriteria?.options ?? [];
  const gridClasses = getGridLayoutClasses(options.length);

  return (
    <motion.div 
      key={`question-${currentStep}`} 
      initial={{ opacity: 0, x: 100 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -100 }} 
      transition={{ duration: 0.5 }}
    >
      <AnimatedCard 
        className="p-4 sm:p-6 md:p-8 relative overflow-hidden w-full" 
        style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}
      >
        <BackgroundDecorations />
        
        <CriteriaHeader title={currentCriteria?.category} currentStep={currentStep} />
        
        <div
          className={`grid gap-3 sm:gap-4 w-full max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto relative z-10 ${(() => {
            const optionsCount = options.length;
            if (optionsCount === 2)
              return "grid-cols-2 place-items-center justify-center max-w-2xl mx-auto";
            if (optionsCount === 3)
              return "grid-cols-3 place-items-center justify-center max-w-4xl mx-auto";
            if (optionsCount === 5)
              return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 place-items-center";
            if (optionsCount === 7)
              return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7 place-items-center";
            if (optionsCount === 8)
              return "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 place-items-center";
            if (optionsCount === 9)
              return "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 xl:grid-cols-9 place-items-center";
            if (optionsCount === 15)
              return "grid-cols-8 grid-rows-2 place-items-center justify-items-center max-w-5xl mx-auto px-8 sm:px-12 md:px-16 auto-cols-fr";
            if (optionsCount >= 6)
              return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
            return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
          })()}`}
        >
          {options.map((option, index) => {
            const isSelected = responses[currentCriteria.id] === option.id;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(currentCriteria.id, option.id)}
                className={`cursor-pointer p-3 sm:p-4 md:p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm w-full h-32 sm:h-36 md:h-40 aspect-square flex flex-col items-center justify-center text-center relative ${
                  isSelected
                    ? "border-white bg-white/30 shadow-lg ring-4 ring-white/30"
                    : "border-white/30 bg-white/20 hover:border-white/50 hover:bg-white/30"
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
                <span className="text-xs sm:text-xs md:text-sm font-medium text-white break-words leading-tight text-center flex items-center justify-center h-full w-full px-1">
                  {option.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {error && <ErrorDisplay error={error} />}
      </AnimatedCard>
    </motion.div>
  );
};

const BackgroundDecorations = () => (
  <>
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
  </>
);

const CriteriaHeader = ({ title, currentStep }) => (
  <div className="text-center mb-8 relative z-10">
    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-white font-bold text-xl">
        {currentStep}
      </span>
    </div>
    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 text-center break-words px-2">
      {title}
    </h2>
    <p className="text-white/80 text-sm sm:text-base text-center">
      Please select the most appropriate option
    </p>
  </div>
);

const ErrorDisplay = ({ error }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="mt-6 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg relative z-10"
  >
    <p className="text-red-100 font-medium text-center">{error}</p>
  </motion.div>
);

export default CriteriaStepGrid;