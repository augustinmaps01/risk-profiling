import React from 'react';

// Grid layout configuration utility
export const getGridLayoutClasses = (itemCount) => {
  const gridConfigs = {
    2: "grid-cols-2 place-items-center justify-center max-w-2xl mx-auto",
    3: "grid-cols-3 place-items-center justify-center max-w-4xl mx-auto",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 place-items-center",
    7: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7 place-items-center",
    8: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 place-items-center",
    9: "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 xl:grid-cols-9 place-items-center",
    15: "grid-cols-8 grid-rows-2 place-items-center justify-items-center max-w-5xl mx-auto px-8 sm:px-12 md:px-16 auto-cols-fr"
  };

  // Fallback logic for other counts
  if (gridConfigs[itemCount]) return gridConfigs[itemCount];
  if (itemCount >= 10) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
  if (itemCount >= 6) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
};

export const getRiskColor = (risk) => {
  const colors = {
    "HIGH RISK": "text-red-600",
    "MODERATE RISK": "text-yellow-600"
  };
  return colors[risk] || "text-green-600";
};

export const getRiskIcon = (risk, iconClass = "w-16 h-16 mx-auto mb-4") => {
  const iconProps = { className: `${iconClass}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" };
  
  if (risk === "HIGH RISK") {
    return (
      <svg {...iconProps} className={`${iconClass} text-red-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    );
  }
  
  if (risk === "MODERATE RISK") {
    return (
      <svg {...iconProps} className={`${iconClass} text-yellow-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  return (
    <svg {...iconProps} className={`${iconClass} text-green-500`}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};