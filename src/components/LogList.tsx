import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Table as TableIcon, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  BookOpen, 
  CheckCircle, 
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  User
} from 'lucide-react';
import { AchievementLevel, Student, TeachingLog } from '../types';
import { SUBJECT_OPTIONS } from '../utils/constants';

interface LogListProps {
  logs: TeachingLog[];
  students: Student[];
  onOpenNewLog: () => void;
  onEditLog: (log: TeachingLog) => void;
  onDuplicateLog: (log: TeachingLog) => void;
  onDeleteLog: (id: string) => void;
  onSelectStudentForPrint: (studentId?: string) => void;
  onExportCSV: () => void;
}

export const LogList: React.FC<LogListProps> = ({
  logs,
  students,
  onOpenNewLog,
  onEditLog,
  onDuplicateLog,
  onDeleteLog,
  onSelectStudentForPrint,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedAchievementFilter, setSelectedAchievementFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');

  // Calendar view state
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Student filter
        if (selectedStudentFilter !== 'all' && log.studentId !== selectedStudentFilter) {
          return false;
        }
        // Subject filter
        if (selectedSubjectFilter !== 'all' && log.subject !== selectedSubjectFilter) {
          return false;
        }
        // Achievement filter
        if (selectedAchievementFilter !== 'all' && log.achievement !== selectedAchievementFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchStudent = log.studentName.toLowerCase().includes(q);
          const matchTopic = log.topic.toLowerCase().includes(q);
          const matchContent = log.content.toLowerCase().includes(q);
          const matchReaction = log.studentReaction.toLowerCase().includes(q);
          const matchRemarks = log.remarks.toLowerCase().includes(q);
          const matchMaterials = (log.materials || '').toLowerCase().includes(q);
          const matchDate = log.date.includes(q);
          const matchSession = `${log.session}차시`.includes(q);

          return (
            matchStudent ||
            matchTopic ||
            matchContent ||
            matchReaction ||
            matchRemarks ||
            matchMaterials ||
            matchDate ||
            matchSession
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Sort descending by date, then session
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.session - a.session;
      });
  }, [logs, selectedStudentFilter, selectedSubjectFilter, selectedAchievementFilter, searchQuery]);

  // Calendar helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month filler
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 12 : month;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month filler to round to complete week
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 1 : month + 2;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const logsByDate = useMemo(() => {
    const map = new Map<string, TeachingLog[]>();
    logs.forEach((log) => {
      const list = map.get(log.date) || [];
      list.push(log);
      map.set(log.date, list);
    });
    return map;
  }, [logs]);

  const getAchievementBadge = (level: AchievementLevel) => {
    switch (level) {
      case '상':
        return <span className="text-emerald-700 font-bold text-xs">상(우수)</span>;
      case '중':
        return <span className="text-amber-700 font-bold text-xs">중(보통)</span>;
      case '하':
        return <span className="text-rose-700 font-bold text-xs">하(노력)</span>;
      default:
        return <span className="text-slate-500 text-xs">-</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생명, 지도주제, 학습내용, 비고, 차시 등으로 빠른 검색..."
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                지우기
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              title="한글 엑셀 호환 CSV 파일로 내보냅니다"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>엑셀 다운로드</span>
            </button>
            <button
              onClick={() => onSelectStudentForPrint(selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>공문서 인쇄</span>
            </button>
          </div>
        </div>

        {/* Filter bar and View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>필터:</span>
            </div>

            {/* Student Filter */}
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">모든 학생 ({students.length}명)</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.grade}-{st.classNum})
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">모든 교과/영역</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Achievement Filter */}
            <select
              value={selectedAchievementFilter}
              onChange={(e) => setSelectedAchievementFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">성취도 전체</option>
              <option value="상">상 (우수)</option>
              <option value="중">중 (보통)</option>
              <option value="하">하 (노력)</option>
            </select>

            {(selectedStudentFilter !== 'all' ||
              selectedSubjectFilter !== 'all' ||
              selectedAchievementFilter !== 'all' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStudentFilter('all');
                  setSelectedSubjectFilter('all');
                  setSelectedAchievementFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
              >
                필터 초기화
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="공식 서식 스타일 표 뷰"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">표 형태</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="상세 카드 뷰"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">카드 형태</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="월간 달력 뷰"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">달력 형태</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          총 <strong className="font-semibold text-slate-800">{filteredLogs.length}건</strong>의 지도 일지가 조회되었습니다.
        </span>
        {selectedStudentFilter !== 'all' && (
          <span className="text-indigo-600 font-medium">
            선택 학생: {students.find((s) => s.id === selectedStudentFilter)?.name} 학생 전용 보기
          </span>
        )}
      </div>

      {/* Main View Area */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">해당 조건의 지도 일지가 없습니다</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            검색어나 필터를 변경하시거나, 새로운 기초학력 지도 일지를 작성해보세요.
          </p>
          <button
            onClick={onOpenNewLog}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 지도일지 작성</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-3.5 w-24">일자</th>
                  <th className="py-3 px-2 w-16 text-center">차시</th>
                  <th className="py-3 px-3 w-28">지도학생</th>
                  <th className="py-3 px-3 w-32">지도영역</th>
                  <th className="py-3 px-4 min-w-[200px]">지도주제 및 학습내용</th>
                  <th className="py-3 px-4 min-w-[180px]">학생 반응 및 지도결과</th>
                  <th className="py-3 px-2 w-16 text-center">성취</th>
                  <th className="py-3 px-3 w-32">비고</th>
                  <th className="py-3 px-3 w-24 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => {
                  const student = students.find((s) => s.id === log.studentId);
                  const gradeClass = student ? `${student.grade}-${student.classNum}` : '';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-3.5 font-medium text-slate-900 whitespace-nowrap">
                        <div>{log.date}</div>
                        <div className="text-[10px] text-slate-500">{log.duration}</div>
                      </td>

                      {/* Session */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {log.session}차시
                        </span>
                      </td>

                      {/* Student */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.studentName}</div>
                        {gradeClass && (
                          <div className="text-[10px] text-slate-500">{gradeClass}</div>
                        )}
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <span className="truncate block max-w-[120px]" title={log.subject}>
                          {log.subject}
                        </span>
                      </td>

                      {/* Topic & Content */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 mb-0.5">
                          {log.topic}
                        </div>
                        <div className="text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                          {log.content}
                        </div>
                        {log.materials && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            교재: {log.materials}
                          </div>
                        )}
                      </td>

                      {/* Student Reaction */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="line-clamp-2 leading-relaxed text-[11px]">
                          {log.studentReaction || '-'}
                        </div>
                      </td>

                      {/* Achievement */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {getAchievementBadge(log.achievement)}
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        <div className="line-clamp-2" title={log.remarks}>
                          {log.remarks || '-'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onDuplicateLog(log)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 cursor-pointer"
                            title="다음 차시로 복제하여 작성"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditLog(log)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200 cursor-pointer"
                            title="일지 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${log.session}차시 (${log.studentName})' 지도일지를 삭제하시겠습니까?`)) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                            title="일지 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLogs.map((log) => {
            const student = students.find((s) => s.id === log.studentId);
            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top line: Session & Date */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {log.session}차시
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {log.studentName} {student ? `(${student.grade}-${student.classNum})` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-600 block">{log.date}</span>
                      <span className="text-[10px] text-slate-400 block">{log.duration}</span>
                    </div>
                  </div>

                  {/* Subject & Topic */}
                  <div className="space-y-1 mb-2.5">
                    <span className="text-[11px] font-semibold text-indigo-600">
                      {log.subject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {log.topic}
                    </h4>
                  </div>

                  {/* Content */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      지도 내용
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line font-mono line-clamp-4 leading-relaxed">
                      {log.content}
                    </p>
                    {log.materials && (
                      <p className="text-[11px] text-slate-500 mt-1 border-t border-slate-200/60 pt-1">
                        교재/교구: {log.materials}
                      </p>
                    )}
                  </div>

                  {/* Student Reaction & Achievement */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700">
                        학생 반응 및 성취수준:
                      </span>
                      <div>{getAchievementBadge(log.achievement)}</div>
                    </div>
                    <p className="text-xs text-slate-700 italic bg-amber-50/50 p-2 rounded border border-amber-100/60 line-clamp-3">
                      "{log.studentReaction || '특이 반응 없음'}"
                    </p>
                  </div>

                  {/* Remarks */}
                  {log.remarks && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong className="font-semibold text-slate-700">비고: </strong>
                      <span>{log.remarks}</span>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">교사 {log.teacher}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateLog(log)}
                      className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 cursor-pointer transition-colors"
                      title="다음 차시로 복제"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>복제</span>
                    </button>
                    <button
                      onClick={() => onEditLog(log)}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>수정</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`'${log.session}차시 (${log.studentName})' 지도일지를 삭제하시겠습니까?`)) {
                          onDeleteLog(log.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-4">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {year}년 {month + 1}월 기초학력 지도 현황
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentCalendarDate(new Date())}
                className="text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                이번 달
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 py-1">
            <span className="text-rose-600">일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span className="text-indigo-600">토</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const dayLogs = logsByDate.get(cell.dateStr) || [];
              const isToday = cell.dateStr === new Date().toISOString().slice(0, 10);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-1.5 border rounded-lg flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50/60 border-slate-100 text-slate-300'
                  } ${isToday ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayLogs.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 rounded">
                        {dayLogs.length}건
                      </span>
                    )}
                  </div>

                  {/* Day log items */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-none">
                    {dayLogs.map((log) => (
                      <div
                        key={log.id}
                        onClick={() => onEditLog(log)}
                        className="p-1 text-[11px] bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 text-indigo-900 rounded cursor-pointer leading-tight truncate"
                        title={`${log.session}차시 - ${log.studentName} (${log.subject}): ${log.topic}`}
                      >
                        <span className="font-bold mr-1">{log.session}차시</span>
                        <span>{log.studentName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
