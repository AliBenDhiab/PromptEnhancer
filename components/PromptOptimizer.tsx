import React, { useState, useCallback, useEffect } from 'react';
import { optimizePrompt } from '../services/geminiService';
import { PromptOptimizationResult, HistoryItem } from '../types';
import Loader from './Loader';
import ResultCard from './ResultCard';
import { OptimizerSkeleton } from './SkeletonLoader';

interface PromptOptimizerProps {
  onComplete: (item: { type: 'optimizer'; input: string; result: PromptOptimizationResult }) => void;
  activeHistoryItem: HistoryItem | null;
}

const PromptOptimizer: React.FC<PromptOptimizerProps> = ({ onComplete, activeHistoryItem }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<PromptOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeHistoryItem && activeHistoryItem.type === 'optimizer') {
      setPrompt(activeHistoryItem.input);
      setResult(activeHistoryItem.result);
      setError(null);
      setLoading(false);
    }
  }, [activeHistoryItem]);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('يرجى إدخال أمر للمتابعة.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const optimizationResult = await optimizePrompt(prompt);
      setResult(optimizationResult);
      onComplete({ type: 'optimizer', input: prompt, result: optimizationResult });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setLoading(false);
    }
  }, [prompt, onComplete]);

  return (
    <div className="flex flex-col items-center w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="اكتب الأمر الذي تريد تحسينه هنا..."
          className="w-full h-32 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
        >
          {loading ? <Loader /> : 'إنشاء تحسينات'}
        </button>
      </form>

      {loading && <OptimizerSkeleton />}
      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {!loading && result && (
        <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResultCard title="مختصر" content={result.short} />
          <ResultCard title="معياري" content={result.standard} />
          <ResultCard title="موسع" content={result.expanded} />
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;
