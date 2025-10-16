import React from 'react';

export const OptimizerSkeleton: React.FC = () => (
  <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-48">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded w-full"></div>
          <div className="h-3 bg-slate-700 rounded w-5/6"></div>
          <div className="h-3 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SummarizerSkeleton: React.FC = () => (
  <div className="mt-8 w-full animate-pulse">
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="h-5 bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);
