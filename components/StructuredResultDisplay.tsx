import React from 'react';
import { PdfSummaryStructuredResult } from '../types';

interface StructuredResultDisplayProps {
  data: PdfSummaryStructuredResult;
}

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);


const StructuredResultDisplay: React.FC<StructuredResultDisplayProps> = ({ data }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-slate-700 pb-2">
          {data.title || 'العنوان المقترح'}
        </h3>
      </div>
      <div>
        <h4 className="font-semibold text-slate-300 mb-3">المواضيع الرئيسية</h4>
        <div className="flex flex-wrap gap-2">
          {data.main_topics && data.main_topics.length > 0 ? (
            data.main_topics.map((topic, index) => (
              <span key={index} className="bg-slate-700 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">
                {topic}
              </span>
            ))
          ) : (
            <p className="text-slate-500 text-sm">لم يتم تحديد مواضيع رئيسية.</p>
          )}
        </div>
      </div>
       <div>
        <h4 className="font-semibold text-slate-300 mb-3">الإجراءات المقترحة</h4>
        <ul className="space-y-2">
          {data.action_items && data.action_items.length > 0 ? (
            data.action_items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </li>
            ))
          ) : (
             <p className="text-slate-500 text-sm">لا توجد إجراءات مقترحة.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StructuredResultDisplay;
