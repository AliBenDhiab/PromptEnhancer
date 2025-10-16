import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const HistoryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M12 8v4l2 2"></path></svg>
);


const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="text-center relative">
        <button
            onClick={onToggleSidebar}
            className="absolute top-1/2 -translate-y-1/2 right-0 p-2 text-slate-400 hover:text-cyan-400 transition-colors z-20"
            aria-label="فتح/إغلاق السجل"
        >
            <HistoryIcon />
        </button>
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 text-transparent bg-clip-text pb-2">
        محسن الأوامر وملخص PDF الذكي
      </h1>
      <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
        استفد من قوة Gemini لتحسين أوامرك وتلخيص مستندات PDF بكفاءة ودقة عالية.
      </p>
    </header>
  );
};

export default Header;