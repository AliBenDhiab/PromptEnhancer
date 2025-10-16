
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  const activeClasses = 'text-cyan-400 border-cyan-400';
  const inactiveClasses = 'text-slate-400 border-transparent hover:text-slate-200';

  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-300 focus:outline-none ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

export default TabButton;
