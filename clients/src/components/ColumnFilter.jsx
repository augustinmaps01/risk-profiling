import React from "react";

export default function ColumnFilter({ column }) {
  const value = column.getFilterValue() || "";
  
  return (
    <input
      value={value}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder="Filter..."
      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white/80 placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      aria-label={`Filter for ${column.id}`}
    />
  );
}