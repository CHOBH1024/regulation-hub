export type RegulationStatus = '완료' | '개정필요' | '제정필요' | '검토중';

export interface RegulationVersion {
  version: string;
  date: string;
  pdfPath: string; // /pdfs/...
  changeLog?: string;
}

export interface RegulationNode {
  id: string;
  title: string;
  status: RegulationStatus;
  assignee?: string;
  dueDate?: string;
  issues?: string[];
  versions: RegulationVersion[];
  children?: RegulationNode[];
}

export const mockRegulations: RegulationNode[] = [
  {
    id: 'top-1',
    title: '정관',
    status: '완료',
    versions: [
      {
        version: 'v2.1',
        date: '2026-01-01',
        pdfPath: '/pdfs/test.pdf',
        changeLog: '최신 개정 사항 반영'
      },
      {
        version: 'v2.0',
        date: '2023-05-10',
        pdfPath: '/pdfs/test.pdf',
        changeLog: '전면 개정'
      }
    ]
  },
  {
    id: 'hr-1',
    title: '인사/노무 관련 규정',
    status: '개정필요',
    assignee: '뻠뻠',
    dueDate: '2026-07-31',
    issues: ['최신 근로기준법 개정안 미반영 부분 전체 수정 필요', '육아휴직 관련 조항 확대 개편'],
    versions: [],
    children: [
      {
        id: 'hr-1-1',
        title: '취업규칙',
        status: '개정필요',
        assignee: '조범희',
        dueDate: '2026-06-30',
        issues: ['연차 휴가 정산 방식 개정', '주 52시간제 관련 유연근무제 도입 명문화'],
        versions: [
          {
            version: 'v3.0',
            date: '2022-03-01',
            pdfPath: '/pdfs/test.pdf',
            changeLog: '주 52시간제 대응 개정'
          }
        ]
      },
      {
        id: 'hr-1-2',
        title: '인사규정',
        status: '완료',
        versions: [
          {
            version: 'v4.2',
            date: '2025-11-20',
            pdfPath: '/pdfs/test.pdf',
            changeLog: '승진 연한 축소 및 평가 기준 정비'
          }
        ]
      }
    ]
  },
  {
    id: 'committee-1',
    title: '위원회 규정',
    status: '제정필요',
    assignee: '조범희',
    dueDate: '2026-08-15',
    issues: ['신설 위원회 발족에 따른 규정 제정', '각 위원회별 의사결정 권한 명확화'],
    versions: [],
    children: [
      {
        id: 'committee-1-1',
        title: '징계위원회 규정',
        status: '완료',
        versions: [
          {
            version: 'v1.1',
            date: '2024-02-15',
            pdfPath: '/pdfs/test.pdf'
          }
        ]
      },
      {
        id: 'committee-1-2',
        title: '투자심의위원회 규정',
        status: '제정필요',
        assignee: '조범희',
        dueDate: '2026-08-01',
        issues: ['초안 작성 중'],
        versions: []
      }
    ]
  }
];
