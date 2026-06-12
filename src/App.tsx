import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { mockRegulations, type RegulationNode, type RegulationVersion } from './data/regulations';
import { Moon, Sun, Upload } from 'lucide-react';

function flattenRegulations(nodes: RegulationNode[]): RegulationNode[] {
  let list: RegulationNode[] = [];
  nodes.forEach(node => {
    list.push(node);
    if (node.children) {
      list = list.concat(flattenRegulations(node.children));
    }
  });
  return list;
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RegulationNode | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<RegulationVersion | null>(null);

  // Initialize selected node
  useEffect(() => {
    const flatList = flattenRegulations(mockRegulations);
    if (flatList.length > 0) {
      handleSelectNode(flatList[0]);
    }
  }, []);

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSelectNode = (node: RegulationNode) => {
    setSelectedNode(node);
    if (node.versions && node.versions.length > 0) {
      setSelectedVersion(node.versions[0]);
    } else {
      setSelectedVersion(null);
    }
  };

  const handleSelectVersion = (version: RegulationVersion) => {
    setSelectedVersion(version);
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
        
        {/* Sidebar */}
        <Sidebar 
          data={mockRegulations} 
          selectedNodeId={selectedNode?.id} 
          onSelect={handleSelectNode} 
        />
        
        {/* Main Panel */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header Theme Toggle & Upload */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <button 
              onClick={() => {
                alert("구글 설문지 링크를 이곳에 연결해 드릴 예정입니다! 뻠뻠님이 설문지를 다 만드신 후 링크를 주시면 바로 연결해 드리겠습니다.");
                window.open('https://forms.google.com', '_blank');
              }}
              className="flex items-center px-3 py-2 rounded-full glass hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium text-sm transition-colors shadow-sm"
            >
              <Upload size={16} className="mr-1.5" />
              업로드 (구글 폼)
            </button>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full glass hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
            >
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
          </div>
          
          {selectedNode ? (
            <MainPanel 
              node={selectedNode} 
              selectedVersion={selectedVersion} 
              onSelectVersion={handleSelectVersion} 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">규정을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
