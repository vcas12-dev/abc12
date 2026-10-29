import React, { useState, useMemo } from 'react';
import { Printer, Filter, ArrowLeft, Check, HelpCircle } from 'lucide-react';
import { SchoolSettings, Student, TeachingLog } from '../types';

interface PrintReportViewProps {
  settings: SchoolSettings;
  students: Student[];
  logs: TeachingLog[];
  initialStudentId?: string;
  onBack: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  settings,
  students,
  logs,
  initialStudentId,
  onBack,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || 'all');
  const [showApproval, setShowApproval] = useState<boolean>(settings.showApproval ?? true);
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (selectedStudentId !== 'all' && log.studentId !== selectedStudentId) {
          return false;
        }
        if (dateFilterStart && log.date < dateFilterStart) {
          return false;
        }
        if (dateFilterEnd && log.date > dateFilterEnd) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Chronological order for official document printing
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.session - b.session;
      });
  }, [logs, selectedStudentId, dateFilterStart, dateFilterEnd]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden on print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="일지 목록으로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                기초학력 책임지도 운영 일지 공문서 인쇄 미리보기
              </h2>
              <p className="text-xs text-slate-500">
                학교 결재용 및 학부모 상담·감사용 공식 A4 규격 출력 서식입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄하기 (PDF 저장)</span>
            </button>
          </div>
        </div>

        {/* Print Filters & Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="font-semibold text-slate-700 mr-1.5">출력 대상 학생:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800"
              >
                <option value="all">전체 학생 통합 인쇄 ({logs.length}건)</option>
                {students.map((st) => {
                  const stLogsCount = logs.filter((l) => l.studentId === st.id).length;
                  return (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.grade}학년 {st.classNum}반) - {stLogsCount}차시
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="font-semibold text-slate-700">기간:</label>
              <input
                type="date"
                value={dateFilterStart}
                onChange={(e) => setDateFilterStart(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700"
              />
              <span className="text-slate-400">~</span>
              <input
                type="date"
                value={dateFilterEnd}
                onChange={(e) => setDateFilterEnd(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showApproval}
                onChange={(e) => setShowApproval(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>결재란(담당·부장·교감·교장) 표시</span>
            </label>
          </div>
        </div>
      </div>

      {/* The Printable A4 Sheet */}
      <div className="bg-white border border-slate-300 shadow-md max-w-4xl mx-auto p-8 sm:p-12 print-page font-sans text-black">
        {/* Document Header & Approval Box */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 text-center pt-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-b-2 border-slate-800 pb-2 inline-block px-4">
              {settings.academicYear}학년도 {settings.programTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              [{settings.schoolName}] 기초학력 향상 지원 책임교육 프로그램
            </p>
          </div>

          {/* Korean Approval Stamp Box (결재란) */}
          {showApproval && (
            <div className="shrink-0">
              <table className="border-collapse border border-slate-800 text-[11px] text-center w-64">
                <tbody>
                  <tr>
                    <th
                      rowSpan={2}
                      className="border border-slate-800 bg-slate-100 py-1 px-1.5 w-6 font-semibold"
                      style={{ writingMode: 'vertical-lr' }}
                    >
                      결재
                    </th>
                    {settings.approvalLine.map((role, idx) => (
                      <th
                        key={idx}
                        className="border border-slate-800 bg-slate-100 py-1 px-2 font-semibold text-xs"
                      >
                        {role}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {settings.approvalLine.map((_, idx) => (
                      <td
                        key={idx}
                        className="border border-slate-800 h-16 w-14 align-bottom pb-1 text-[10px] text-slate-400"
                      >
                        (서명)
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Basic Information Summary Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-slate-800 text-xs text-slate-900">
            <tbody>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-2 px-3 w-28 text-center font-bold">
                  지도 교사
                </th>
                <td className="border border-slate-800 py-2 px-3">
                  {settings.teacherName} (인)
                </td>
                <th className="border border-slate-800 bg-slate-100 py-2 px-3 w-28 text-center font-bold">
                  지도 대상
                </th>
                <td className="border border-slate-800 py-2 px-3 font-semibold">
                  {currentStudent ? (
                    <span>
                      {currentStudent.name} ({currentStudent.grade}학년 {currentStudent.classNum}반)
                    </span>
                  ) : (
                    <span>전체 참여 학생 ({students.length}명)</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-2 px-3 text-center font-bold">
                  중점 지도영역
                </th>
                <td className="border border-slate-800 py-2 px-3">
                  {currentStudent ? currentStudent.subject : '국어, 수학 및 기초학습 전반'}
                </td>
                <th className="border border-slate-800 bg-slate-100 py-2 px-3 text-center font-bold">
                  이수 / 계획차시
                </th>
                <td className="border border-slate-800 py-2 px-3 font-medium">
                  총 {filteredLogs.length}차시 완료{' '}
                  {currentStudent && `(목표: ${currentStudent.targetSessions}차시)`}
                </td>
              </tr>
              {currentStudent?.initialDiagnosis && (
                <tr>
                  <th className="border border-slate-800 bg-slate-100 py-2 px-3 text-center font-bold">
                    초기 진단 현황
                  </th>
                  <td colSpan={3} className="border border-slate-800 py-2 px-3 text-slate-800">
                    {currentStudent.initialDiagnosis}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detailed Logs Table */}
        <div>
          <table className="w-full border-collapse border border-slate-800 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800">
                <th className="border border-slate-800 py-2.5 px-2 w-10 text-center">순</th>
                <th className="border border-slate-800 py-2.5 px-2 w-20 text-center">일자</th>
                <th className="border border-slate-800 py-2.5 px-2 w-14 text-center">차시</th>
                <th className="border border-slate-800 py-2.5 px-2 w-18 text-center">학생명</th>
                <th className="border border-slate-800 py-2.5 px-3 w-40 text-left">지도주제 및 영역</th>
                <th className="border border-slate-800 py-2.5 px-3 text-left">지도 내용 (활동 과정)</th>
                <th className="border border-slate-800 py-2.5 px-3 w-44 text-left">학생 반응 및 지도결과</th>
                <th className="border border-slate-800 py-2.5 px-1.5 w-12 text-center">성취</th>
                <th className="border border-slate-800 py-2.5 px-2 w-24 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log.id} className="border-b border-slate-800 break-inside-avoid">
                  {/* Index */}
                  <td className="border border-slate-800 py-2 px-1 text-center font-medium">
                    {index + 1}
                  </td>

                  {/* Date & Time */}
                  <td className="border border-slate-800 py-2 px-1.5 text-center whitespace-nowrap">
                    <div className="font-medium">{log.date}</div>
                    <div className="text-[10px] text-slate-500">{log.duration}</div>
                  </td>

                  {/* Session */}
                  <td className="border border-slate-800 py-2 px-1 text-center font-bold">
                    {log.session}차시
                  </td>

                  {/* Student Name */}
                  <td className="border border-slate-800 py-2 px-1.5 text-center font-semibold">
                    {log.studentName}
                  </td>

                  {/* Subject & Topic */}
                  <td className="border border-slate-800 py-2 px-2.5">
                    <div className="text-[10px] text-indigo-700 font-semibold mb-0.5">
                      [{log.subject}]
                    </div>
                    <div className="font-medium text-slate-900 leading-snug">
                      {log.topic}
                    </div>
                  </td>

                  {/* Content */}
                  <td className="border border-slate-800 py-2 px-2.5">
                    <div className="whitespace-pre-line leading-relaxed font-mono text-[11px] text-slate-800">
                      {log.content}
                    </div>
                    {log.materials && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        * 교재: {log.materials}
                      </div>
                    )}
                  </td>

                  {/* Student Reaction */}
                  <td className="border border-slate-800 py-2 px-2 text-[11px] text-slate-800 leading-relaxed">
                    {log.studentReaction || '-'}
                  </td>

                  {/* Achievement */}
                  <td className="border border-slate-800 py-2 px-1 text-center font-bold">
                    {log.achievement}
                  </td>

                  {/* Remarks */}
                  <td className="border border-slate-800 py-2 px-2 text-[10px] text-slate-700 leading-tight">
                    {log.remarks || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer verification statement */}
        <div className="mt-8 text-center text-xs text-slate-700 space-y-2 break-inside-avoid">
          <p>위와 같이 기초학력 책임지도 운영 일지를 작성 및 제출합니다.</p>
          <p className="font-semibold text-sm pt-2">
            {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일
          </p>
          <p className="text-sm font-bold text-slate-900">
            {settings.schoolName} 지도교사: {settings.teacherName} (인)
          </p>
        </div>
      </div>
    </div>
  );
};
