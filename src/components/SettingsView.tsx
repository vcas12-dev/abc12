import React, { useState } from 'react';
import { 
  Save, 
  RotateCcw, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  ShieldCheck, 
  School, 
  User, 
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SchoolSettings, Student, TeachingLog } from '../types';
import { exportFullBackup, exportLogsToCSV, resetToInitialData } from '../utils/storage';

interface SettingsViewProps {
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  students: Student[];
  logs: TeachingLog[];
  onDataReset: (newSettings: SchoolSettings, newStudents: Student[], newLogs: TeachingLog[]) => void;
  onDataImport: (importedData: { settings?: SchoolSettings; students?: Student[]; logs?: TeachingLog[] }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  students,
  logs,
  onDataReset,
  onDataImport,
}) => {
  const [schoolName, setSchoolName] = useState<string>(settings.schoolName);
  const [academicYear, setAcademicYear] = useState<string>(settings.academicYear);
  const [teacherName, setTeacherName] = useState<string>(settings.teacherName);
  const [programTitle, setProgramTitle] = useState<string>(settings.programTitle);
  const [approvalLineText, setApprovalLineText] = useState<string>(
    settings.approvalLine.join(', ')
  );
  const [showApproval, setShowApproval] = useState<boolean>(settings.showApproval);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedApproval = approvalLineText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const updated: SchoolSettings = {
      schoolName: schoolName.trim() || '행복초등학교',
      academicYear: academicYear.trim() || '2026',
      teacherName: teacherName.trim() || '선생님',
      programTitle: programTitle.trim() || '기초학력 책임지도 운영 일지',
      approvalLine: updatedApproval.length > 0 ? updatedApproval : ['담당', '부장', '교감', '교장'],
      showApproval,
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.students && parsed.logs) {
          if (confirm('백업 파일에서 학생 명단과 일지 데이터를 복원하시겠습니까? (기존 데이터와 대체됩니다)')) {
            onDataImport(parsed);
            alert('데이터가 성공적으로 복원되었습니다.');
          }
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 파싱하는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          학교 및 기초학력 프로그램 기본 환경 설정
        </h2>
        <p className="text-xs text-slate-500">
          공문서 출력 서식, 일지 결재란, 학교명, 학년도 및 지도교사 기본 정보를 설정합니다.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          공문서 및 일지 헤더 정보
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              학교명
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="예: 서울행복초등학교"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              학년도
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              지도 교사 성명
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="김선생"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              운영 프로그램 명칭
            </label>
            <input
              type="text"
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              placeholder="기초학력 책임지도 운영 일지"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {/* Approval Line Settings */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-700 block">
                공문서 결재란 직책 라인 설정
              </label>
              <span className="text-[11px] text-slate-500">
                쉼표(,)로 구분하여 결재란 직책명을 순서대로 입력하세요.
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showApproval}
                onChange={(e) => setShowApproval(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>인쇄 시 결재란 표시</span>
            </label>
          </div>

          <input
            type="text"
            value={approvalLineText}
            onChange={(e) => setApprovalLineText(e.target.value)}
            placeholder="담당, 부장, 교감, 교장"
            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />

          {/* Preview of approval line */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600 block mb-1.5">결재란 미리보기:</span>
            <div className="inline-flex border border-slate-700 bg-white text-center">
              <div className="border-r border-slate-700 bg-slate-100 py-1 px-2 font-bold text-[11px]">
                결재
              </div>
              {approvalLineText.split(',').map((pos, idx) => (
                <div key={idx} className="border-r last:border-r-0 border-slate-700 w-14">
                  <div className="border-b border-slate-700 bg-slate-100 py-0.5 text-[10px] font-semibold">
                    {pos.trim() || '-'}
                  </div>
                  <div className="h-8 text-[9px] text-slate-400 flex items-end justify-center pb-0.5">
                    (서명)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                설정이 저장되었습니다.
              </span>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>설정 저장하기</span>
          </button>
        </div>
      </form>

      {/* Data Backup & Export Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          데이터 백업 및 엑셀 관리
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Excel Export */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>엑셀(CSV) 내보내기</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              작성된 지도 일지 전체({logs.length}건)를 한글 인코딩(BOM)이 포함된 엑셀 호환 CSV 파일로 저장합니다.
            </p>
            <button
              type="button"
              onClick={() => exportLogsToCSV(logs, students)}
              className="mt-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 파일 다운로드</span>
            </button>
          </div>

          {/* JSON Full Backup */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>전체 백업 (JSON)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              학생 명단, 지도 일지, 학교 설정을 하나의 백업 파일로 보관하여 다른 브라우저나 PC로 이전할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => exportFullBackup(settings, students, logs)}
              className="mt-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>전체 백업 다운로드</span>
            </button>
          </div>
        </div>

        {/* Restore & Sample Data */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Restore file input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>백업 파일 복원하기 (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset to initial sample data */}
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  '기본 샘플 데이터로 복원하시겠습니까? 현재 입력된 사용자 데이터가 기본 예시 데이터로 초기화됩니다.'
                )
              ) {
                const initial = resetToInitialData();
                onDataReset(initial.settings, initial.students, initial.logs);
                alert('샘플 데이터가 다시 로드되었습니다.');
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 샘플 데이터로 초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
};
