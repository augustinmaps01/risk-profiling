export const getRiskColor = (risk) => {
  if (risk === "HIGH RISK") return "text-red-600 font-bold";
  if (risk === "MODERATE RISK") return "text-yellow-600 font-bold";
  return "text-green-600 font-bold";
};

export const getRiskColorClass = (risk) => {
  if (risk === "HIGH RISK") return "risk-high";
  if (risk === "MODERATE RISK") return "risk-moderate";
  return "risk-low";
};