import { useState, useMemo } from 'react';
import type { RegulationNode, RegulationStatus, RegulationCategory } from '../data/regulations';
import { CATEGORIES } from '../data/regulations';
import { ChevronRight, ChevronDown, FileText, Folder, ExternalLink, Search, Star, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  data: RegulationNode[];
  selectedNodeId?: string;
  favorites: string[];
  onSelect: (node: RegulationNode) => void;
  onToggleFavorite: (id: string) => void;
}

const STATUS_STYLE: Record<RegulationStatus, string> = {
  '완료':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  '개정필요': 'bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-400',
  '제정필요': 'bg-rose-100   text-rose-700   dark:bg-rose-500/20   dark:text-rose-400',
  '검토중':  'bg-blue-100   text-blue-700   dark:bg-blue-500/20   dark:text-blue-400',
};

function getDday(dueDate?: string) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
}

const StatusBadge = ({ status }: { status: RegulationStatus }) => (
  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${STATUS_STYLE[status]}`}>
    {status}
  </span>
);

const DdayBadge = ({ dueDate }: { dueDate?: string }) => {
  const d = getDday(dueDate);
  if (d === null) return null;
  const color = d <= 7 ? 'bg-rose-500' : d <= 30 ? 'bg-amber-500' : 'bg-slate-400';
  return (
    <span className={`text-[9px] font-bold px-1 py-0.5 rounded text-white ${color} shrink-0`}>
      {d <= 0 ? '기한초과' : `D-${d}`}
    </span>
  );
};

const TreeNode = ({
  node, level, selectedNodeId, favorites, onSelect, onToggleFavorite,
}: {
  node: RegulationNode;
  level: number;
  selectedNodeId?: string;
  favorites: string[];
  onSelect: (node: RegulationNode) => void;
  onToggleFavorite: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = !!node.children?.length;
  const isSelected = node.id === selectedNodeId;
  const isFav = favorites.includes(node.id);

  if (node.externalUrl) {
    return (
      <a
        href={node.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center py-2 px-3 rounded-md mb-0.5 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <ExternalLink size={14} className="mr-2 opacity-50 group-hover:opacity-100 text-blue-500 shrink-0" />
        <span className="flex-1 truncate text-sm">{node.title}</span>
        <StatusBadge status={node.status} />
      </a>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        className={clsx(
          'flex items-center py-2 px-3 cursor-pointer rounded-md mb-0.5 transition-colors group',
          isSelected
            ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
            : 'text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => { onSelect(node); if (hasChildren && isSelected) setIsOpen(o => !o); }}
      >
        <div
          className="flex items-center w-5 mr-1 shrink-0"
          onClick={e => { if (hasChildren) { e.stopPropagation(); setIsOpen(o => !o); } }}
        >
          {hasChildren
            ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
            : <span className="w-[14px]" />}
        </div>

        {hasChildren
          ? <Folder size={15} className="mr-2 opacity-60 shrink-0" />
          : <FileText size={15} className="mr-2 opacity-60 shrink-0" />}

        <span className="flex-1 truncate text-sm select-none">{node.title}</span>

        <div className="flex items-center gap-1 ml-1">
          <DdayBadge dueDate={node.dueDate} />
          <StatusBadge status={node.status} />
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(node.id); }}
            className={clsx(
              'p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity',
              isFav && 'opacity-100'
            )}
          >
            <Star size={12} className={isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} />
          </button>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div>
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              favorites={favorites}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function flattenAll(nodes: RegulationNode[]): RegulationNode[] {
  return nodes.flatMap(n => [n, ...flattenAll(n.children ?? [])]);
}

export const Sidebar = ({ data, selectedNodeId, favorites, onSelect, onToggleFavorite }: SidebarProps) => {
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<RegulationCategory, boolean>>({
    ffwpu: true, internal: true, event: true, manual: true,
  });

  const toggleCategory = (key: RegulationCategory) =>
    setOpenCategories(p => ({ ...p, [key]: !p[key] }));

  const allFlat = useMemo(() => flattenAll(data), [data]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allFlat.filter(n => n.title.toLowerCase().includes(q));
  }, [search, allFlat]);

  const favNodes = useMemo(
    () => allFlat.filter(n => favorites.includes(n.id)),
    [allFlat, favorites]
  );

  const byCategory = (cat: RegulationCategory) => data.filter(n => n.category === cat);

  const stats = useMemo(() => ({
    total: allFlat.filter(n => !n.externalUrl).length,
    done: allFlat.filter(n => n.status === '완료').length,
    urgent: allFlat.filter(n => { const d = getDday(n.dueDate); return d !== null && d <= 14; }).length,
  }), [allFlat]);

  return (
    <div className="w-80 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">
          Rule Inside
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">통합 규정 관리 시스템</p>

        {/* Stats */}
        <div className="flex gap-3 mt-3">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-800 dark:text-white">{stats.total}</div>
            <div className="text-[10px] text-slate-400">전체</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{stats.done}</div>
            <div className="text-[10px] text-slate-400">완료</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-rose-500">{stats.urgent}</div>
            <div className="text-[10px] text-slate-400">기한임박</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="규정 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Search Results */}
        {search.trim() ? (
          <div>
            <p className="text-xs text-slate-400 px-2 mb-1">{searchResults.length}건 검색됨</p>
            {searchResults.length === 0
              ? <p className="text-sm text-slate-400 px-2">결과 없음</p>
              : searchResults.map(n => (
                <TreeNode key={n.id} node={n} level={0} selectedNodeId={selectedNodeId} favorites={favorites} onSelect={node => { onSelect(node); setSearch(''); }} onToggleFavorite={onToggleFavorite} />
              ))
            }
          </div>
        ) : (
          <>
            {/* Favorites */}
            {favNodes.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star size={12} className="fill-amber-400" /> 즐겨찾기
                </div>
                {favNodes.map(n => (
                  <TreeNode key={n.id} node={n} level={0} selectedNodeId={selectedNodeId} favorites={favorites} onSelect={onSelect} onToggleFavorite={onToggleFavorite} />
                ))}
              </div>
            )}

            {/* Urgent */}
            {stats.urgent > 0 && (
              <div className="mb-3 mx-1 px-3 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg border border-rose-200 dark:border-rose-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                  <AlertTriangle size={12} /> 기한 임박 {stats.urgent}건
                </div>
                {allFlat.filter(n => { const d = getDday(n.dueDate); return d !== null && d <= 14; }).map(n => (
                  <div key={n.id} onClick={() => onSelect(n)} className="flex items-center gap-1.5 py-0.5 cursor-pointer hover:opacity-70">
                    <Clock size={11} className="text-rose-400 shrink-0" />
                    <span className="text-xs text-rose-700 dark:text-rose-300 truncate">{n.title}</span>
                    <DdayBadge dueDate={n.dueDate} />
                  </div>
                ))}
              </div>
            )}

            {/* Categories */}
            {CATEGORIES.map(cat => {
              const nodes = byCategory(cat.key);
              if (nodes.length === 0) return null;
              const isOpen = openCategories[cat.key];
              return (
                <div key={cat.key} className="mb-2">
                  <button
                    onClick={() => toggleCategory(cat.key)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${cat.color} font-bold text-xs`}
                  >
                    <span>{cat.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-normal">{nodes.length}</span>
                      {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </div>
                  </button>
                  {isOpen && nodes.map(n => (
                    <TreeNode key={n.id} node={n} level={0} selectedNodeId={selectedNodeId} favorites={favorites} onSelect={onSelect} onToggleFavorite={onToggleFavorite} />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
