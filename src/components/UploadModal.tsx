import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText } from 'lucide-react';
import { uploadPdf } from '../utils/supabase';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal = ({ onClose, onSuccess }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    regulationId: 'top-1', // 임시 기본값
    version: '',
    publisher: '',
    date: new Date().toISOString().split('T')[0],
    status: '완료',
    memo: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('PDF 파일을 선택해주세요.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Storage Upload
      const filePath = `regulations/${formData.regulationId}_${formData.version}.pdf`;
      const { data: uploadData, error: uploadError } = await uploadPdf(file, filePath);
      
      if (uploadError) throw uploadError;

      // 2. Mock DB Update (추후 Supabase DB 연결 시 실제 테이블 Insert 코드로 교체)
      console.log('업로드 완료 데이터:', {
        ...formData,
        pdfPath: uploadData?.path
      });
      
      alert('업로드가 완료되었습니다. (현재 Supabase Key 미입력으로 콘솔에만 기록됨)');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <Upload size={18} className="mr-2 text-indigo-500" />
            새 규정 / 버전 업로드
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Input */}
          <div 
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="hidden" 
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center w-full">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                isDragging ? 'bg-indigo-200 dark:bg-indigo-500/40' : 'bg-indigo-100 dark:bg-indigo-500/20'
              }`}>
                <FileText size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">PDF 파일 선택</span>
              <span className="text-xs text-slate-500 mt-1">
                {file ? file.name : '또는 여기로 드래그 앤 드롭'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">대상 규정</label>
              <select 
                value={formData.regulationId}
                onChange={e => setFormData({...formData, regulationId: e.target.value})}
                className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2"
              >
                <option value="top-1">정관</option>
                <option value="hr-1-1">취업규칙</option>
                <option value="hr-1-2">인사규정</option>
                <option value="committee-1-1">징계위원회 규정</option>
                <option value="committee-1-2">투자심의위원회 규정</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">상태</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2"
              >
                <option value="완료">완료 (제정/개정됨)</option>
                <option value="개정필요">개정 필요</option>
                <option value="제정필요">제정 필요</option>
                <option value="검토중">검토 중</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">버전 (예: v3.0)</label>
              <input 
                type="text" 
                required
                value={formData.version}
                onChange={e => setFormData({...formData, version: e.target.value})}
                className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">게시자/담당자</label>
              <input 
                type="text" 
                required
                value={formData.publisher}
                onChange={e => setFormData({...formData, publisher: e.target.value})}
                className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">시행/등록 일자</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">수정 내역 및 논의 사항 (메모)</label>
            <textarea 
              required
              rows={3}
              placeholder="무엇이 개정되었는지, 어떤 논의가 필요한지 적어주세요."
              value={formData.memo}
              onChange={e => setFormData({...formData, memo: e.target.value})}
              className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              취소
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center"
            >
              {isUploading ? '업로드 중...' : '업로드 및 저장'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
