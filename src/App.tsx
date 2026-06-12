import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { TableView } from './components/TableView';
import { UploadModal } from './components/UploadModal';
import { mockRegulations, type RegulationNode, type RegulationVersion } from './data/regulations';
import { Moon, Sun, Upload, LayoutList, LayoutGrid } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

function flattenRegulations(nodes: RegulationNode[]): RegulationNode[] {
  return nodes.flatMap(n => [n, ...flattenRegulations(n.children ?? [])]);
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RegulationNode | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<RegulationVersion | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') ?? '[]'); } catch { return []; }
  });
  const [isTableMode, setIsTableMode] = useState(false);

  useEffect(() => {
    const flat = flattenRegulations(mockRegulations);
    if (flat.length > 0) handleSelectNode(flat[0]);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleSelectNode = (node: RegulationNode) => {
    setSelectedNode(node);
    setSelectedVersion(node.versions?.[0] ?? null);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">

        <Sidebar
          data={mockRegulations}
          selectedNodeId={selectedNode?.id}
          favorites={favorites}
          onSelect={handleSelectNode}
          onToggleFavorite={handleToggleFavorite}
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <button
              onClick={() => setIsTableMode(m => !m)}
              className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors shadow-sm border ${
                isTableMode
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isTableMode ? <LayoutGrid size={15} className="mr-1.5" /> : <LayoutList size={15} className="mr-1.5" />}
              {isTableMode ? '뷰어 모드' : '테이블 모드'}
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium text-sm transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <Upload size={15} className="mr-1.5" />
              업로드
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
          </div>

          {isTableMode ? (
            <TableView
              data={mockRegulations}
              favorites={favorites}
              onSelect={handleSelectNode}
              onToggleFavorite={handleToggleFavorite}
              onSwitchToViewer={() => setIsTableMode(false)}
            />
          ) : selectedNode ? (
            <MainPanel
              node={selectedNode}
              selectedVersion={selectedVersion}
              onSelectVersion={setSelectedVersion}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400">규정을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            onClose={() => setIsUploadOpen(false)}
            onSuccess={() => console.log('업로드 성공')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
