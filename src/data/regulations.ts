export type RegulationStatus = '완료' | '개정필요' | '제정필요' | '검토중';
export type RegulationCategory = 'ffwpu' | 'internal' | 'event' | 'manual';

export interface RegulationVersion {
  version: string;
  date: string;
  pdfPath: string;
  changeLog?: string;
}

export interface RegulationNode {
  id: string;
  title: string;
  status: RegulationStatus;
  category: RegulationCategory;
  assignee?: string;
  dueDate?: string;
  progress?: number; // 0-100
  issues?: string[];
  versions: RegulationVersion[];
  children?: RegulationNode[];
  externalUrl?: string; // 외부 링크 전용
}

export const CATEGORIES: { key: RegulationCategory; label: string; color: string }[] = [
  { key: 'ffwpu',    label: '신한국가정연합 규정', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'internal', label: '협회 내 규정',        color: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'event',    label: '행사 규정',            color: 'text-violet-600 dark:text-violet-400' },
  { key: 'manual',   label: '업무 메뉴얼',          color: 'text-emerald-600 dark:text-emerald-400' },
];

export const mockRegulations: RegulationNode[] = [
  // ── 신한국가정연합 규정 (외부 링크) ──────────────────────
  {
    id: 'ffwpu-1',
    title: '신한국가정연합 헌법',
    status: '완료',
    category: 'ffwpu',
    externalUrl: 'https://ffwp.org',
    versions: [],
  },
  {
    id: 'ffwpu-2',
    title: '세계본부 규정집',
    status: '완료',
    category: 'ffwpu',
    externalUrl: 'https://ffwp.org',
    versions: [],
  },

  // ── 협회 내 규정 ──────────────────────────────────────────
  {
    id: 'top-1',
    title: '정관',
    status: '완료',
    category: 'internal',
    progress: 100,
    versions: [
      { version: 'v2.1', date: '2026-01-01', pdfPath: '/pdfs/test.pdf', changeLog: '최신 개정 사항 반영' },
      { version: 'v2.0', date: '2023-05-10', pdfPath: '/pdfs/test.pdf', changeLog: '전면 개정' },
    ],
  },
  {
    id: 'hr-1',
    title: '인사/노무 관련 규정',
    status: '개정필요',
    category: 'internal',
    assignee: '뻠뻠',
    dueDate: '2026-07-31',
    progress: 40,
    issues: ['최신 근로기준법 개정안 미반영 부분 전체 수정 필요', '육아휴직 관련 조항 확대 개편'],
    versions: [],
    children: [
      {
        id: 'hr-1-1',
        title: '취업규칙',
        status: '개정필요',
        category: 'internal',
        assignee: '조범희',
        dueDate: '2026-06-30',
        progress: 60,
        issues: ['연차 휴가 정산 방식 개정', '주 52시간제 관련 유연근무제 도입 명문화'],
        versions: [{ version: 'v3.0', date: '2022-03-01', pdfPath: '/pdfs/test.pdf', changeLog: '주 52시간제 대응 개정' }],
      },
      {
        id: 'hr-1-2',
        title: '인사규정',
        status: '완료',
        category: 'internal',
        progress: 100,
        versions: [{ version: 'v4.2', date: '2025-11-20', pdfPath: '/pdfs/test.pdf', changeLog: '승진 연한 축소 및 평가 기준 정비' }],
      },
    ],
  },
  {
    id: 'committee-1',
    title: '위원회 규정',
    status: '제정필요',
    category: 'internal',
    assignee: '조범희',
    dueDate: '2026-08-15',
    progress: 15,
    issues: ['신설 위원회 발족에 따른 규정 제정', '각 위원회별 의사결정 권한 명확화'],
    versions: [],
    children: [
      {
        id: 'committee-1-1',
        title: '징계위원회 규정',
        status: '완료',
        category: 'internal',
        progress: 100,
        versions: [{ version: 'v1.1', date: '2024-02-15', pdfPath: '/pdfs/test.pdf' }],
      },
      {
        id: 'committee-1-2',
        title: '투자심의위원회 규정',
        status: '제정필요',
        category: 'internal',
        assignee: '조범희',
        dueDate: '2026-08-01',
        progress: 10,
        issues: ['초안 작성 중'],
        versions: [],
      },
    ],
  },

  // ── 행사 규정 ─────────────────────────────────────────────
  {
    id: 'event-1',
    title: '행사 운영 규정',
    status: '완료',
    category: 'event',
    progress: 100,
    versions: [{ version: 'v1.0', date: '2025-03-01', pdfPath: '/pdfs/test.pdf', changeLog: '제정' }],
    children: [
      {
        id: 'event-1-1',
        title: '대규모 행사 안전 지침',
        status: '개정필요',
        category: 'event',
        assignee: '조범희',
        dueDate: '2026-09-01',
        progress: 50,
        issues: ['2024년 안전사고 사례 반영'],
        versions: [{ version: 'v1.2', date: '2024-06-10', pdfPath: '/pdfs/test.pdf' }],
      },
      {
        id: 'event-1-2',
        title: '예산 집행 기준',
        status: '완료',
        category: 'event',
        progress: 100,
        versions: [{ version: 'v2.0', date: '2025-01-15', pdfPath: '/pdfs/test.pdf' }],
      },
    ],
  },
  {
    id: 'event-2',
    title: '교육 행사 규정',
    status: '검토중',
    category: 'event',
    assignee: '뻠뻠',
    dueDate: '2026-10-01',
    progress: 30,
    versions: [],
  },

  // ── 업무 메뉴얼 ───────────────────────────────────────────
  {
    id: 'manual-1',
    title: '총무국 업무 메뉴얼',
    status: '완료',
    category: 'manual',
    progress: 100,
    versions: [{ version: 'v3.1', date: '2025-08-01', pdfPath: '/pdfs/test.pdf', changeLog: '조직 개편 반영' }],
    children: [
      {
        id: 'manual-1-1',
        title: '공문 작성 및 결재 절차',
        status: '완료',
        category: 'manual',
        progress: 100,
        versions: [{ version: 'v2.0', date: '2024-09-01', pdfPath: '/pdfs/test.pdf' }],
      },
      {
        id: 'manual-1-2',
        title: '예산·회계 처리 절차',
        status: '개정필요',
        category: 'manual',
        assignee: '조범희',
        dueDate: '2026-07-15',
        progress: 70,
        issues: ['전자결재 시스템 도입에 따른 절차 업데이트'],
        versions: [{ version: 'v1.5', date: '2023-11-01', pdfPath: '/pdfs/test.pdf' }],
      },
    ],
  },
  {
    id: 'manual-2',
    title: '신규 직원 온보딩 메뉴얼',
    status: '검토중',
    category: 'manual',
    assignee: '뻠뻠',
    dueDate: '2026-08-30',
    progress: 45,
    versions: [{ version: 'v1.0', date: '2024-03-01', pdfPath: '/pdfs/test.pdf' }],
  },
];
