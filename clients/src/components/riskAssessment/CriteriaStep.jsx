import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../ui';

const CriteriaStep = ({ criteria, responses, onSelect, error }) => {
  const getGridClasses = (optionsCount) => {
    if (optionsCount === 2) return "grid-cols-2 place-items-center justify-center max-w-2xl";
    if (optionsCount === 3) return "grid-cols-3 place-items-center justify-center max-w-4xl mx-auto";
    if (optionsCount >= 6) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <motion.div
      key={`step-${criteria.id}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-4 sm:mb-6 md:mb-8 text-center relative z-20">
        <CriteriaHeader criteria={criteria} />
      </div>

      <div className={`grid gap-3 sm:gap-4 w-full max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto relative z-10 ${getGridClasses((criteria.options ?? []).length)}`}>
        {criteria.options?.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={responses[criteria.id] === option.id}
            onSelect={() => onSelect(criteria.id, option.id)}
          />
        ))}
      </div>

      {error && <ErrorMessage error={error} />}
    </motion.div>
  );
};

const CriteriaHeader = ({ criteria }) => (
  <>
    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 md:mb-4 break-words leading-tight">
      {criteria.label}
    </h2>
    {criteria.description && (
      <p className="text-white/80 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 break-words leading-relaxed max-w-4xl mx-auto">
        {criteria.description}
      </p>
    )}
  </>
);

const OptionCard = ({ option, isSelected, onSelect }) => {
  const getCardHeight = () => {
    const labelLength = option.label?.length || 0;
    if (labelLength > 100) return "min-h-[140px] sm:min-h-[160px] md:min-h-[180px]";
    if (labelLength > 50) return "min-h-[120px] sm:min-h-[140px] md:min-h-[160px]";
    return "min-h-[100px] sm:min-h-[120px] md:min-h-[140px]";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 transition-all duration-300 border-2 backdrop-blur-sm ${getCardHeight()} ${
        isSelected
          ? "bg-white/95 border-white text-slate-800 shadow-xl"
          : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
      }`}
    >
      {isSelected && <SelectedIndicator />}
      
      <span className="text-xs sm:text-xs md:text-sm font-medium text-white break-words leading-tight text-center flex items-center justify-center h-full w-full px-1">
        {option.label}
      </span>
    </motion.div>
  );
};

const SelectedIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
  >
    <svg
      className="w-4 h-4 text-white"
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
);

const ErrorMessage = ({ error }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-6 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg relative z-10"
  >
    <p className="text-red-100 font-medium text-center">{error}</p>
  </motion.div>
);

export default CriteriaStep;