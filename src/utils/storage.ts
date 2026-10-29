import { SchoolSettings, Student, TeachingLog } from '../types';
import { DEFAULT_SETTINGS, INITIAL_LOGS, INITIAL_STUDENTS } from './constants';

const SETTINGS_KEY = 'edu_guidance_settings_v1';
const STUDENTS_KEY = 'edu_guidance_students_v1';
const LOGS_KEY = 'edu_guidance_logs_v1';

export function loadSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: SchoolSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load students:', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students:', e);
  }
}

export function loadLogs(): TeachingLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load logs:', e);
  }
  return INITIAL_LOGS;
}

export function saveLogs(logs: TeachingLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
}

/**
 * Reset all data back to realistic initial demonstration state
 */
export function resetToInitialData(): {
  settings: SchoolSettings;
  students: Student[];
  logs: TeachingLog[];
} {
  saveSettings(DEFAULT_SETTINGS);
  saveStudents(INITIAL_STUDENTS);
  saveLogs(INITIAL_LOGS);
  return {
    settings: DEFAULT_SETTINGS,
    students: INITIAL_STUDENTS,
    logs: INITIAL_LOGS,
  };
}

/**
 * Export teaching logs to Excel-compatible CSV format with UTF-8 BOM
 */
export function exportLogsToCSV(logs: TeachingLog[], students: Student[]): void {
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const headers = [
    '일지ID',
    '일자',
    '차시',
    '학생명',
    '학년/반',
    '지도영역(과목)',
    '지도시간',
    '지도주제/단원',
    '지도내용',
    '활용교재·교구',
    '학생반응 및 성취수준',
    '성취도',
    '비고(특이사항/계획)',
    '지도교사',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = logs.map((log) => {
    const st = studentMap.get(log.studentId);
    const gradeClass = st ? `${st.grade}학년 ${st.classNum}반` : '-';

    return [
      escapeCSV(log.id),
      escapeCSV(log.date),
      escapeCSV(`${log.session}차시`),
      escapeCSV(log.studentName),
      escapeCSV(gradeClass),
      escapeCSV(log.subject),
      escapeCSV(log.duration),
      escapeCSV(log.topic),
      escapeCSV(log.content),
      escapeCSV(log.materials || '-'),
      escapeCSV(log.studentReaction),
      escapeCSV(log.achievement),
      escapeCSV(log.remarks),
      escapeCSV(log.teacher),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `기초학력_지도일지_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export full JSON backup
 */
export function exportFullBackup(
  settings: SchoolSettings,
  students: Student[],
  logs: TeachingLog[]
): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings,
    students,
    logs,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `기초학력지도일지_전체백업_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
