import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText, ChevronDown } from 'lucide-react';
import { uploadPdf } from '../utils/supabase';
import { mockRegulations, type RegulationNode } from '../data/regulations';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function flattenAll(nodes: RegulationNode[]): RegulationNode[] {
  return nodes.flatMap(n => [n, ...flattenAll(n.children ?? [])]);
}

function nextVersion(existing: { version: string }[]): string {
  if (existing.length === 0) return 'v1.0';
  const nums = existing.map(v => {
    const m = v.version.match(/v?(\d+)\.(\d+)/);
    return m ? parseFloat(`${m[1]}.${m[2]}`) : 0;
  });
  const latest = Math.max(...nums);
  const [major, minor] = String(latest.toFixed(1)).split('.');
  return `v${major}.${Number(minor) + 1}`;
}

export const UploadModal = ({ onClose, onSuccess }: UploadModalProps) => {
  const allNodes = flattenAll(mockRegulations).filter(n => !n.externalUrl);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RegulationNode>(allNodes[0]);
  const [version, setVersion] = useState(() => nextVersion(allNodes[0]?.versions ?? []));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleNodeChange = (id: string) => {
    const node = allNodes.find(n => n.id === id);
    if (!node) return;
    setSelectedNode(node);
    setVersion(nextVersion(node.versions));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert('PDF 파일을 선택해주세요.'); return; }

    setIsUploading(true);
    try {
      const filePath = `regulations/${selectedNode.id}_${version.replace(/\./g, '-')}.pdf`;
      const { publicUrl, error } = await uploadPdf(file, filePath);
      if (error) throw error;

      console.log('업로드 완료:', { node: selectedNode.id, version, date, publicUrl });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Upload size={16} className="text-indigo-500" />
            규정 PDF 업로드
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File drop zone */}
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDragging ? 'bg-indigo-200' : 'bg-indigo-100 dark:bg-indigo-900/40'}`}>
              <FileText size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">PDF 파일 선택 또는 드래그</p>
                <p className="text-xs text-slate-400 mt-1">최대 1GB</p>
              </div>
            )}
          </label>

          {/* 대상 규정 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">대상 규정</label>
            <div className="relative">
              <select
                value={selectedNode.id}
                onChange={e => handleNodeChange(e.target.value)}
                className="w-full appearance-none text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {allNodes.map(n => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 버전 + 시행일 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                버전
                {selectedNode.versions.length > 0 && (
                  <span className="text-slate-400 font-normal ml-1">(현재 {selectedNode.versions[0]?.version})</span>
                )}
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="예: v2.0"
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">시행일</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* 기존 버전 목록 */}
          {selectedNode.versions.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">기존 버전 ({selectedNode.versions.length}개 보관 중)</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.versions.map(v => (
                  <span key={v.version} className="text-[11px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {v.version} <span className="text-slate-400">({v.date})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              취소
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> 업로드 중...</>
              ) : (
                <><Upload size={14} /> 저장</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
