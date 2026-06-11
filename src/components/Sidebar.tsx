import { useState } from 'react';
import type { RegulationNode, RegulationStatus } from '../data/regulations';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  data: RegulationNode[];
  selectedNodeId?: string;
  onSelect: (node: RegulationNode) => void;
}

const StatusBadge = ({ status }: { status: RegulationStatus }) => {
  const styles = {
    '완료': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    '개정필요': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    '제정필요': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    '검토중': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
  };

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${styles[status]}`}>
      {status}
    </span>
  );
};

const TreeNode = ({ node, level, selectedNodeId, onSelect }: { node: RegulationNode, level: number, selectedNodeId?: string, onSelect: (node: RegulationNode) => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedNodeId;

  return (
    <div className="flex flex-col">
      <div 
        className={clsx(
          "flex items-center py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors rounded-md mb-0.5",
          isSelected ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm" : "text-slate-700 dark:text-slate-200 font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => {
          onSelect(node);
          if (hasChildren && isSelected) setIsOpen(!isOpen); // Toggle open on double click essentially
        }}
      >
        <div className="flex items-center w-5 mr-1" onClick={(e) => {
          if (hasChildren) {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }
        }}>
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <span className="w-[14px]" />}
        </div>
        
        {hasChildren ? <Folder size={16} className="mr-2 opacity-70" /> : <FileText size={16} className="mr-2 opacity-70" />}
        
        <span className="flex-1 truncate text-sm select-none">{node.title}</span>
        
        <div className="ml-2">
          <StatusBadge status={node.status} />
        </div>
      </div>
      
      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} selectedNodeId={selectedNodeId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ data, selectedNodeId, onSelect }: SidebarProps) => {
  return (
    <div className="w-80 h-full border-r border-slate-200 dark:border-slate-800 glass flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">
          Rule Inside
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">통합 규정 관리 시스템</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {data.map(node => (
          <TreeNode 
            key={node.id} 
            node={node} 
            level={0} 
            selectedNodeId={selectedNodeId} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </div>
  );
};
