import React, { useState, useCallback } from 'react';

interface ResultCardProps {
  title: string;
  content: string;
  isCode?: boolean;
  isStreaming?: boolean;
}

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6 9 17l-5-5"></path>
    </svg>
);


const ResultCard: React.FC<ResultCardProps> = ({ title, content, isCode = false, isStreaming = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const contentElement = (
      <>
          {content}
          {isStreaming && <span className="inline-block w-2 h-5 bg-cyan-400 animate-pulse ms-1 translate-y-1"></span>}
      </>
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-cyan-400">{title}</h3>
        <button
          onClick={handleCopy}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors duration-200"
          aria-label="نسخ إلى الحافظة"
        >
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>
      {isCode ? (
        <pre className="whitespace-pre-wrap bg-slate-900 p-3 rounded-md text-sm text-slate-300 overflow-x-auto flex-grow">
          <code>{contentElement}</code>
        </pre>
      ) : (
        <p className="whitespace-pre-wrap text-slate-300 flex-grow">{contentElement}</p>
      )}
    </div>
  );
};

export default ResultCard;
