export interface Student {
  id: string;
  name: string;
  grade: number;
  classNum: number;
  subject: string;
  targetSessions: number;
  initialDiagnosis?: string;
  learningGoal?: string;
  guardianContact?: string;
  status: 'active' | 'completed';
  notes?: string;
  createdAt: string;
}

export type AchievementLevel = '상' | '중' | '하';

export interface TeachingLog {
  id: string;
  studentId: string;
  studentIds?: string[];
  studentName: string;
  date: string; // YYYY-MM-DD
  session: number; // 차시 (1, 2, 3...)
  duration: string; // e.g. "40분", "15:00~15:40"
  subject: string; // 국어, 수학, 영어, 기초학습, 심리정서, 기타
  topic: string; // 지도 주제 / 단원
  content: string; // 지도 내용
  materials?: string; // 교재 및 교구
  studentReaction: string; // 학생 반응 및 성취수준
  achievement: AchievementLevel; // 성취도
  remarks: string; // 비고 (특이사항, 다음 차시 계획 등)
  teacher: string; // 지도교사
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSettings {
  schoolName: string;
  academicYear: string;
  teacherName: string;
  programTitle: string;
  approvalLine: string[];
  showApproval: boolean;
}

export interface QuickTemplate {
  category: '국어' | '수학' | '일반' | '학생반응' | '비고';
  title: string;
  topic?: string;
  content?: string;
  studentReaction?: string;
  remarks?: string;
}
