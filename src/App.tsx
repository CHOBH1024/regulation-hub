import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { mockRegulations, type RegulationNode, type RegulationVersion } from './data/regulations';
import { Moon, Sun } from 'lucide-react';

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
          {/* Header Theme Toggle */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
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
