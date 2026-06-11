import { useState, useEffect } from 'react';
import type { RegulationNode, RegulationVersion } from '../data/regulations';
import { Clock, User, AlertCircle, FileText, ChevronDown, MessageSquare, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomPdfViewer } from './CustomPdfViewer';

interface MainPanelProps {
  node: RegulationNode;
  selectedVersion: RegulationVersion | null;
  onSelectVersion: (version: RegulationVersion) => void;
}

const MemoPanel = ({ nodeId, onClose }: { nodeId: string, onClose: () => void }) => {
  const [memo, setMemo] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`memo_${nodeId}`);
    if (saved) setMemo(saved);
    setIsSaved(false);
  }, [nodeId]);

  const handleSave = () => {
    localStorage.setItem(`memo_${nodeId}`, memo);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-20 right-6 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
          <MessageSquare size={16} className="mr-2" />
          규정 전체 메모장
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 flex-1">
        <textarea 
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="여기에 규정 관련 메모를 남겨주세요. 브라우저에 자동 저장됩니다."
          className="w-full h-48 resize-none bg-transparent border-none focus:ring-0 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400"
        />
      </div>
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center">
        {isSaved && <span className="text-xs text-emerald-500 mr-3">저장되었습니다</span>}
        <button 
          onClick={handleSave}
          className="flex items-center px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-colors"
        >
          <Save size={14} className="mr-1.5" />
          저장하기
        </button>
      </div>
    </motion.div>
  );
};

export const MainPanel = ({ node, selectedVersion, onSelectVersion }: MainPanelProps) => {
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 relative">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-20 shadow-sm flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{node.title}</h2>
            
            <div className="flex flex-wrap gap-4 mt-3">
              {node.assignee && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <User size={16} className="mr-1.5 text-indigo-500" />
                  담당자: <span className="font-medium ml-1 text-slate-800 dark:text-slate-200">{node.assignee}</span>
                </div>
              )}
              {node.dueDate && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Clock size={16} className="mr-1.5 text-rose-500" />
                  기한: <span className="font-medium ml-1 text-slate-800 dark:text-slate-200">{node.dueDate}</span>
                </div>
              )}
            </div>
            
            {node.issues && node.issues.length > 0 && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3">
                <div className="flex items-center text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  <AlertCircle size={16} className="mr-1.5" />
                  세부 논의 사항
                </div>
                <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-300/80 space-y-1">
                  {node.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 pr-12">
              <button 
                onClick={() => setIsMemoOpen(!isMemoOpen)}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
                  isMemoOpen 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare size={16} className="mr-1.5" />
                전체 메모
              </button>
            </div>

            {/* Version Selector */}
            {node.versions && node.versions.length > 0 && selectedVersion && (
              <div className="relative mt-auto">
                <button 
                  onClick={() => setIsVersionOpen(!isVersionOpen)}
                  className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileText size={16} className="mr-2 text-indigo-500" />
                  {selectedVersion.version} <span className="text-slate-400 font-normal ml-2 mr-1">({selectedVersion.date})</span>
                  <ChevronDown size={16} className="ml-2 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isVersionOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto">
                        {node.versions.map(ver => (
                          <div 
                            key={ver.version}
                            onClick={() => {
                              onSelectVersion(ver);
                              setIsVersionOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedVersion.version === ver.version ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-semibold ${selectedVersion.version === ver.version ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {ver.version}
                              </span>
                              <span className="text-xs text-slate-500">{ver.date}</span>
                            </div>
                            {ver.changeLog && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ver.changeLog}</p>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer with Annotations */}
      <div className="flex-1 bg-slate-200 dark:bg-slate-900 p-4 relative z-10 overflow-hidden flex flex-col">
        {selectedVersion ? (
          <div className="flex-1 w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-300 dark:border-slate-700 overflow-hidden relative">
            <CustomPdfViewer pdfPath={selectedVersion.pdfPath} />
          </div>
        ) : (
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <FileText size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">등록된 규정 파일(PDF)이 없습니다.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMemoOpen && (
          <MemoPanel nodeId={node.id} onClose={() => setIsMemoOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
