import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PromptOptimizer from './components/PromptOptimizer';
import PdfSummarizer from './components/PdfSummarizer';
import HistorySidebar from './components/HistorySidebar';
import { HistoryItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';

type ActiveTab = 'optimizer' | 'summarizer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('optimizer');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('gemini-app-history', []);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setActiveHistoryItem(null); // Reset active history when switching tabs
  }, []);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    // FIX: By spreading `item` inside a type-narrowed block, we create a new history object
    // that correctly retains the specific `result` type from either `OptimizerHistory` or
    // `SummarizerHistory`. This resolves type conflicts with the `HistoryItem` union type.
    let newHistoryItem: HistoryItem;
    if (item.type === 'optimizer') {
      newHistoryItem = {
        ...item,
        id: `history-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    } else {
      newHistoryItem = {
        ...item,
        id: `history-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    }

    setHistory(prev => [newHistoryItem, ...prev]);
    setActiveHistoryItem(newHistoryItem);
    setIsSidebarOpen(true); // Open sidebar on new item
  }, [setHistory]);

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveTab(item.type);
    setActiveHistoryItem(item);
     if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  
  const clearHistory = useCallback(() => {
    setHistory([]);
    setActiveHistoryItem(null);
  }, [setHistory]);

  const MainContent = () => {
    switch(activeTab) {
      case 'optimizer':
        return <PromptOptimizer onComplete={addHistoryItem} activeHistoryItem={activeHistoryItem} />;
      case 'summarizer':
        return <PdfSummarizer onComplete={addHistoryItem} activeHistoryItem={activeHistoryItem} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
            <div
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            aria-hidden="true"
            ></div>
        )}

        <HistorySidebar
            history={history}
            onSelect={handleSelectHistory}
            onClear={clearHistory}
            activeItemId={activeHistoryItem?.id}
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
        />
        <div className={`flex-grow flex flex-col items-center w-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-72' : 'md:mr-0'}`}>
            <div className="w-full max-w-4xl mx-auto">
            <Header onToggleSidebar={toggleSidebar} />
            <main className="mt-8">
                <div className="flex justify-center border-b border-slate-700 mb-8">
                    <button
                        onClick={() => handleTabChange('optimizer')}
                        className={`px-4 sm:px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-300 focus:outline-none ${activeTab === 'optimizer' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                    >
                        محسن الأوامر
                    </button>
                    <button
                        onClick={() => handleTabChange('summarizer')}
                        className={`px-4 sm:px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-300 focus:outline-none ${activeTab === 'summarizer' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                    >
                        ملخص PDF
                    </button>
                </div>
                <div className="transition-opacity duration-500">
                    <MainContent />
                </div>
            </main>
            </div>
        </div>
    </div>
  );
};

export default App;
