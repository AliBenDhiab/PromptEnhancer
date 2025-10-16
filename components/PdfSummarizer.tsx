import React, { useState, useCallback, useEffect } from 'react';
import { summarizePdfText } from '../services/geminiService';
import { PdfSummaryResult, SummaryLength, HistoryItem } from '../types';
import Loader from './Loader';
import ResultCard from './ResultCard';
import TabButton from './TabButton';
import { SummarizerSkeleton } from './SkeletonLoader';
import StructuredResultDisplay from './StructuredResultDisplay';

interface PdfSummarizerProps {
  onComplete: (item: { type: 'summarizer'; input: string; result: PdfSummaryResult }) => void;
  activeHistoryItem: HistoryItem | null;
}


const PdfSummarizer: React.FC<PdfSummarizerProps> = ({ onComplete, activeHistoryItem }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [result, setResult] = useState<PdfSummaryResult | null>(null);
  const [streamedSummary, setStreamedSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'points' | 'json'>('summary');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('متوسط');
  const [isDragging, setIsDragging] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  useEffect(() => {
    import('pdfjs-dist/build/pdf').then(pdfjs => {
      // FIX: The workerSrc must point to the same CDN and version as the main pdf.js library,
      // as defined in the importmap, to avoid version mismatch and loading errors.
      pdfjs.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^5.4.296/build/pdf.worker.mjs`;
      setPdfjsLib(pdfjs);
    });
  }, []);

   useEffect(() => {
    if (activeHistoryItem && activeHistoryItem.type === 'summarizer') {
      setFileName(activeHistoryItem.input);
      setResult(activeHistoryItem.result);
      setFile(null);
      setError(null);
      setLoading(false);
      setStreamedSummary('');
      setProgressMessage('');
    }
  }, [activeHistoryItem]);


  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setResult(null);
        setError(null);
        setStreamedSummary('');
    }
  };


  const extractTextFromPdf = useCallback(async (selectedFile: File): Promise<string> => {
    if (!pdfjsLib) throw new Error("مكتبة PDF لم يتم تحميلها بعد.");
    setProgressMessage('جاري قراءة الملف...');
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgressMessage(`استخراج النص من الصفحة ${i} من ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }, [pdfjsLib]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('يرجى رفع ملف PDF للمتابعة.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamedSummary('');

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        throw new Error("لم يتم العثور على نص في ملف PDF. قد يكون الملف عبارة عن صور فقط.");
      }
      const summaryResult = await summarizePdfText(text, summaryLength, setProgressMessage, setStreamedSummary);
      setResult(summaryResult);
      onComplete({ type: 'summarizer', input: file.name, result: summaryResult });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setLoading(false);
      setProgressMessage('');
    }
  }, [file, extractTextFromPdf, summaryLength, onComplete]);

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       if (e.dataTransfer.files[0].type === "application/pdf") {
         handleFileChange(e.dataTransfer.files[0]);
       } else {
         setError("يرجى رفع ملف من نوع PDF فقط.");
       }
    }
  };

  const renderResultContent = () => {
    if (!result) return null;
    switch (activeResultTab) {
      case 'summary':
        return <ResultCard title="الملخص" content={result.summary} />;
      case 'points':
        return <ResultCard title="النقاط الرئيسية" content={result.keyPoints.map(p => `• ${p}`).join('\n')} />;
      case 'json':
        return <StructuredResultDisplay data={result.structured} />;
    }
  };

  const showSkeleton = loading && !streamedSummary && !result;
  const showStreaming = loading && streamedSummary && !result;

  return (
    <div className="flex flex-col items-center w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full flex justify-center items-center gap-x-2 sm:gap-x-4 bg-slate-800 p-2 rounded-lg mb-4">
          <span className="font-medium text-slate-300 text-sm sm:text-base">طول الملخص:</span>
          {(['موجز', 'متوسط', 'مفصل'] as SummaryLength[]).map((len) => (
            <button
              key={len} type="button" onClick={() => setSummaryLength(len)}
              className={`px-3 sm:px-4 py-1.5 text-sm sm:text-base rounded-md transition-colors duration-300 ${summaryLength === len ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
              {len}
            </button>
          ))}
        </div>
        <label
          htmlFor="pdf-upload"
          onDragEnter={(e) => handleDragEvents(e, true)}
          onDragOver={(e) => handleDragEvents(e, true)}
          onDragLeave={(e) => handleDragEvents(e, false)}
          onDrop={handleDrop}
          className={`w-full cursor-pointer bg-slate-800 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-700 hover:border-cyan-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-slate-500 mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>
          <span className="font-medium text-slate-300">{fileName || 'اختر ملف PDF أو اسحبه هنا'}</span>
          <span className="text-sm text-slate-500 mt-1">سيتم معالجة الملف محليًا في متصفحك</span>
        </label>
        <input id="pdf-upload" type="file" accept=".pdf" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" />
        <button type="submit" disabled={loading || !file} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
          {loading ? <Loader /> : 'تلخيص الملف'}
        </button>
      </form>

      {loading && progressMessage && <p className="mt-4 text-cyan-400 animate-pulse">{progressMessage}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {showSkeleton && <SummarizerSkeleton />}
      {showStreaming && (
        <div className="mt-8 w-full">
          <ResultCard title="الملخص (جاري التوليد...)" content={streamedSummary} isStreaming={true} />
        </div>
      )}
      {result && (
        <div className="mt-8 w-full">
          <div className="flex justify-center border-b border-slate-700 mb-4">
            <TabButton label="الملخص" isActive={activeResultTab === 'summary'} onClick={() => setActiveResultTab('summary')} />
            <TabButton label="النقاط الرئيسية" isActive={activeResultTab === 'points'} onClick={() => setActiveResultTab('points')} />
            <TabButton label="البيانات المنظمة" isActive={activeResultTab === 'json'} onClick={() => setActiveResultTab('json')} />
          </div>
          <div className="transition-opacity duration-300">{renderResultContent()}</div>
        </div>
      )}
    </div>
  );
};

export default PdfSummarizer;