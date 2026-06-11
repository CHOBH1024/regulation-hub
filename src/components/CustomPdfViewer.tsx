import { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { MessageSquare, X, Check } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFAnnotation {
  id: string;
  pdfPath: string;
  pageIndex: number;
  x: number;
  y: number;
  content: string;
}

interface CustomPdfViewerProps {
  pdfPath: string;
}

export const CustomPdfViewer = ({ pdfPath }: CustomPdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [activePin, setActivePin] = useState<{ pageIndex: number; x: number; y: number } | null>(null);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [isModeAdd, setIsModeAdd] = useState(false);

  useEffect(() => {
    // Load annotations for this pdf
    const saved = localStorage.getItem(`annotations_${pdfPath}`);
    if (saved) {
      setAnnotations(JSON.parse(saved));
    } else {
      setAnnotations([]);
    }
  }, [pdfPath]);

  const saveAnnotations = (newAnnotations: PDFAnnotation[]) => {
    setAnnotations(newAnnotations);
    localStorage.setItem(`annotations_${pdfPath}`, JSON.stringify(newAnnotations));
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (!isModeAdd) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setActivePin({ pageIndex, x, y });
    setNewMemoContent('');
  };

  const handleSavePin = () => {
    if (!activePin || !newMemoContent.trim()) return;

    const newPin: PDFAnnotation = {
      id: Date.now().toString(),
      pdfPath,
      pageIndex: activePin.pageIndex,
      x: activePin.x,
      y: activePin.y,
      content: newMemoContent.trim()
    };

    saveAnnotations([...annotations, newPin]);
    setActivePin(null);
    setNewMemoContent('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-200 dark:bg-slate-900 overflow-hidden relative rounded-xl">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
        <span className="text-sm font-medium mr-4 text-slate-700 dark:text-slate-300">
          페이지별 메모(마커) 남기기:
        </span>
        <button
          onClick={() => setIsModeAdd(!isModeAdd)}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
            isModeAdd 
              ? 'bg-rose-500 text-white shadow-inner' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {isModeAdd ? '마커 찍기 모드 ON' : '마커 모드 켜기'}
        </button>
      </div>

      {/* PDF Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="flex flex-col items-center gap-6">
          <Document
            file={pdfPath}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="p-8 text-slate-500">PDF 로딩 중...</div>}
            error={<div className="p-8 text-rose-500">PDF를 불러오지 못했습니다.</div>}
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <div 
                key={`page_${index + 1}`} 
                className="relative bg-white shadow-xl mb-8"
                onClick={(e) => handlePageClick(e, index)}
                style={{ cursor: isModeAdd ? 'crosshair' : 'default' }}
              >
                <Page 
                  pageNumber={index + 1} 
                  renderTextLayer={true} 
                  renderAnnotationLayer={true}
                  width={800} // Fixed width for consistent relative coordinates
                />

                {/* Render Annotations for this page */}
                {annotations.filter(a => a.pageIndex === index).map((ann) => (
                  <div
                    key={ann.id}
                    className="absolute z-20 group"
                    style={{ left: `${ann.x * 100}%`, top: `${ann.y * 100}%`, transform: 'translate(-50%, -100%)' }}
                  >
                    {/* Pin Icon */}
                    <div className="w-8 h-8 flex items-center justify-center text-rose-500 cursor-pointer drop-shadow-md">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>

                    {/* Tooltip Content */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl z-30 pointer-events-auto border border-slate-700/50">
                      <div className="flex items-center text-xs font-semibold text-rose-400 mb-1 border-b border-slate-700/50 pb-1">
                        <MessageSquare size={12} className="mr-1" /> 메모
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            saveAnnotations(annotations.filter(a => a.id !== ann.id));
                          }}
                          className="ml-auto text-slate-400 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                    </div>
                  </div>
                ))}

                {/* Active Pending Pin */}
                {activePin && activePin.pageIndex === index && (
                  <div
                    className="absolute z-30"
                    style={{ left: `${activePin.x * 100}%`, top: `${activePin.y * 100}%`, transform: 'translate(-50%, -100%)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-rose-500 drop-shadow-md animate-bounce">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
                      <textarea
                        autoFocus
                        value={newMemoContent}
                        onChange={e => setNewMemoContent(e.target.value)}
                        placeholder="이 부분에 대한 수정 사항이나 메모를 입력하세요."
                        className="w-full h-24 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 resize-none text-slate-800 dark:text-slate-200"
                      />
                      <div className="flex justify-end mt-2 gap-2">
                        <button
                          onClick={() => setActivePin(null)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSavePin}
                          className="flex items-center px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                        >
                          <Check size={14} className="mr-1" /> 저장
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};
