import type { RegulationNode } from '../data/regulations';
import { CATEGORIES } from '../data/regulations';
import { Star, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface TableViewProps {
  data: RegulationNode[];
  favorites: string[];
  onSelect: (node: RegulationNode) => void;
  onToggleFavorite: (id: string) => void;
  onSwitchToViewer: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  '완료':    'bg-emerald-100 text-emerald-700',
  '개정필요': 'bg-amber-100  text-amber-700',
  '제정필요': 'bg-rose-100   text-rose-700',
  '검토중':  'bg-blue-100   text-blue-700',
};

function getDday(dueDate?: string) {
  if (!dueDate) return null;
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
}

function flattenAll(nodes: RegulationNode[]): RegulationNode[] {
  return nodes.flatMap(n => [n, ...flattenAll(n.children ?? [])]);
}

export const TableView = ({ data, favorites, onSelect, onToggleFavorite, onSwitchToViewer }: TableViewProps) => {
  const all = flattenAll(data).filter(n => !n.externalUrl);

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-16">
      {/* Summary cards */}
      <div className="flex gap-3 px-6 pb-4">
        {[
          { label: '전체 규정', value: all.length, color: 'text-slate-700 dark:text-white', bg: 'bg-white dark:bg-slate-800' },
          { label: '완료', value: all.filter(n => n.status === '완료').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: '개정 필요', value: all.filter(n => n.status === '개정필요').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: '제정 필요', value: all.filter(n => n.status === '제정필요').length, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: '기한 임박(14일)', value: all.filter(n => { const d = getDday(n.dueDate); return d !== null && d <= 14; }).length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className={`flex-1 ${s.bg} rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700`}>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">규정명</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">분류</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">진행률</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">담당자</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">기한</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">최신버전</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">논의사항</th>
              </tr>
            </thead>
            <tbody>
              {all.map((node, i) => {
                const dday = getDday(node.dueDate);
                const catLabel = CATEGORIES.find(c => c.key === node.category)?.label ?? '';
                const isFav = favorites.includes(node.id);
                return (
                  <tr
                    key={node.id}
                    onClick={() => { onSelect(node); onSwitchToViewer(); }}
                    className={clsx(
                      'border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors',
                      i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30',
                      'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                    )}
                  >
                    <td className="px-4 py-3">
                      <button onClick={e => { e.stopPropagation(); onToggleFavorite(node.id); }}>
                        <Star size={14} className={isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      {node.versions.length > 0 ? <FileText size={13} className="text-indigo-400 shrink-0" /> : <span className="w-[13px]" />}
                      {node.title}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{catLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${STATUS_STYLE[node.status]}`}>
                        {node.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {node.progress !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.progress === 100 ? 'bg-emerald-500' : node.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-400'}`}
                              style={{ width: `${node.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{node.progress}%</span>
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{node.assignee ?? '—'}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {node.dueDate ? (
                        <span className={clsx(
                          'font-medium',
                          dday !== null && dday <= 7 ? 'text-rose-600' : dday !== null && dday <= 30 ? 'text-amber-600' : 'text-slate-500'
                        )}>
                          {node.dueDate} {dday !== null && <span className="text-[10px]">({dday <= 0 ? '초과' : `D-${dday}`})</span>}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{node.versions[0]?.version ?? '—'}</td>
                    <td className="px-4 py-3">
                      {node.issues?.length ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle size={13} />
                          <span className="text-xs">{node.issues.length}건</span>
                        </div>
                      ) : <span className="text-slate-300 text-xs">없음</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* External links */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">외부 연결 규정</p>
          <div className="flex gap-2 flex-wrap">
            {flattenAll(data).filter(n => n.externalUrl).map(n => (
              <a key={n.id} href={n.externalUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <ExternalLink size={12} />
                {n.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
