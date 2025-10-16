import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  activeItemId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PromptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
);

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>
);

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, activeItemId, isOpen, onClose }) => {
  return (
    <aside className={`fixed top-0 right-0 h-full w-72 bg-slate-950/70 backdrop-blur-sm border-l border-slate-800 flex flex-col p-4 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-200">السجل</h2>
        <div className="flex items-center gap-2">
            <button onClick={onClear} disabled={history.length === 0} className="text-sm text-slate-400 hover:text-red-400 disabled:text-slate-600 transition-colors">
            مسح الكل
            </button>
             <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700">
                <CloseIcon />
            </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M8 8h8v8"></path></svg>
            <p className="font-medium">لا يوجد سجل حتى الآن</p>
            <p className="text-sm">ستظهر عملياتك الأخيرة هنا.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item)}
                  className={`w-full text-right flex items-center gap-3 p-2 rounded-md transition-colors duration-200 ${activeItemId === item.id ? 'bg-indigo-600/30 text-cyan-300' : 'hover:bg-slate-800/50 text-slate-300'}`}
                >
                  {item.type === 'optimizer' ? <PromptIcon /> : <PdfIcon />}
                  <span className="truncate text-sm flex-grow">{item.input}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;