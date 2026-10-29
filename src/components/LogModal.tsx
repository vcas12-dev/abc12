import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  BookmarkCheck,
  Trash2,
  Copy
} from 'lucide-react';
import { AchievementLevel, QuickTemplate, Student, TeachingLog } from '../types';
import { QUICK_TEMPLATES, SUBJECT_OPTIONS } from '../utils/constants';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<TeachingLog, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  onDelete?: (id: string) => void;
  initialLog?: TeachingLog | null;
  students: Student[];
  allLogs: TeachingLog[];
  defaultTeacherName: string;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialLog,
  students,
  allLogs,
  defaultTeacherName,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [session, setSession] = useState<number>(1);
  const [duration, setDuration] = useState<string>('40분 (14:50~15:30)');
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [topic, setTopic] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [materials, setMaterials] = useState<string>('');
  const [studentReaction, setStudentReaction] = useState<string>('');
  const [achievement, setAchievement] = useState<AchievementLevel>('중');
  const [remarks, setRemarks] = useState<string>('');
  const [teacher, setTeacher] = useState<string>(defaultTeacherName);

  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [templateFilter, setTemplateFilter] = useState<string>('전체');

  // Sync state when initialLog changes
  useEffect(() => {
    if (initialLog) {
      setSelectedStudentId(initialLog.studentId);
      setDate(initialLog.date);
      setSession(initialLog.session);
      setDuration(initialLog.duration);
      setSubject(initialLog.subject);
      setTopic(initialLog.topic);
      setContent(initialLog.content);
      setMaterials(initialLog.materials || '');
      setStudentReaction(initialLog.studentReaction);
      setAchievement(initialLog.achievement);
      setRemarks(initialLog.remarks);
      setTeacher(initialLog.teacher || defaultTeacherName);
    } else {
      // New log creation
      const firstStudent = students[0];
      const initialStudentId = firstStudent ? firstStudent.id : '';
      setSelectedStudentId(initialStudentId);
      setDate(new Date().toISOString().slice(0, 10));
      setDuration('40분 (14:50~15:30)');
      setTeacher(defaultTeacherName);
      setTopic('');
      setContent('');
      setMaterials('');
      setStudentReaction('');
      setAchievement('중');
      setRemarks('');

      if (initialStudentId) {
        // Calculate next session for this student
        const studentLogs = allLogs.filter((l) => l.studentId === initialStudentId);
        const maxSession = studentLogs.reduce((max, l) => Math.max(max, l.session), 0);
        setSession(maxSession + 1);
        if (firstStudent) {
          setSubject(firstStudent.subject || SUBJECT_OPTIONS[0]);
        }
      } else {
        setSession(1);
        setSubject(SUBJECT_OPTIONS[0]);
      }
    }
  }, [initialLog, isOpen, students, defaultTeacherName]);

  // When student selection changes on create mode, update next session and subject
  const handleStudentChange = (newStudentId: string) => {
    setSelectedStudentId(newStudentId);
    const targetStudent = students.find((s) => s.id === newStudentId);
    if (targetStudent) {
      if (targetStudent.subject) {
        setSubject(targetStudent.subject);
      }
      if (!initialLog) {
        const studentLogs = allLogs.filter((l) => l.studentId === newStudentId);
        const maxSession = studentLogs.reduce((max, l) => Math.max(max, l.session), 0);
        setSession(maxSession + 1);
      }
    }
  };

  const handleApplyTemplate = (tpl: QuickTemplate) => {
    if (tpl.topic) setTopic(tpl.topic);
    if (tpl.content) {
      setContent((prev) => (prev ? `${prev}\n${tpl.content}` : tpl.content || ''));
    }
    if (tpl.studentReaction) {
      setStudentReaction((prev) => (prev ? `${prev} ${tpl.studentReaction}` : tpl.studentReaction || ''));
    }
    if (tpl.remarks) {
      setRemarks((prev) => (prev ? `${prev} ${tpl.remarks}` : tpl.remarks || ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStudent = students.find((s) => s.id === selectedStudentId);
    const studentName = currentStudent ? currentStudent.name : '미지정';

    if (!selectedStudentId) {
      alert('지도 학생을 선택해주세요.');
      return;
    }
    if (!topic.trim()) {
      alert('지도 주제/단원을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('지도 내용을 입력해주세요.');
      return;
    }

    onSave(
      {
        studentId: selectedStudentId,
        studentName,
        date,
        session: Number(session) || 1,
        duration,
        subject,
        topic: topic.trim(),
        content: content.trim(),
        materials: materials.trim(),
        studentReaction: studentReaction.trim(),
        achievement,
        remarks: remarks.trim(),
        teacher: teacher.trim() || defaultTeacherName,
      },
      initialLog?.id
    );
    onClose();
  };

  if (!isOpen) return null;

  const currentStudentObj = students.find((s) => s.id === selectedStudentId);

  const filteredTemplates = QUICK_TEMPLATES.filter((tpl) => {
    if (templateFilter === '전체') return true;
    return tpl.category === templateFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialLog ? '지도 일지 수정' : '새 기초학력 지도 일지 작성'}
              </h2>
              <p className="text-xs text-slate-500">
                차시별 지도 내용, 학생의 성취 수준 및 특이사항을 기록합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick template banner button */}
          <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-900">
                자주 쓰는 표준 지도 문구 및 상용구
              </span>
              <span className="text-xs text-indigo-700 hidden sm:inline">
                (원클릭으로 지도내용, 학생반응, 비고 자동 삽입)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              {showTemplates ? '템플릿 서랍 닫기' : '템플릿 모음 열기'}
            </button>
          </div>

          {/* Quick templates drawer */}
          {showTemplates && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">추천 교육과정 템플릿 선택</span>
                <div className="flex gap-1">
                  {['전체', '국어', '수학', '학생반응', '비고'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTemplateFilter(cat)}
                      className={`text-xs px-2 py-0.5 rounded cursor-pointer ${
                        templateFilter === cat
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredTemplates.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2.5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs rounded-md cursor-pointer transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                        {tpl.title}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                        {tpl.category}
                      </span>
                    </div>
                    {tpl.topic && (
                      <p className="text-[11px] text-slate-600 truncate">{tpl.topic}</p>
                    )}
                    {tpl.studentReaction && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        "{tpl.studentReaction}"
                      </p>
                    )}
                    <span className="text-[10px] text-indigo-500 font-medium group-hover:underline mt-1 inline-block">
                      + 내용에 적용하기
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form id="log-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Student, Date, Session, Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 대상 학생 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>
                    학생 선택
                  </option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.grade}학년 {st.classNum}반) - {st.subject}
                    </option>
                  ))}
                </select>
                {currentStudentObj && (
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    목표: {currentStudentObj.targetSessions}차시 중 진행
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 일자 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Session (차시) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  차시 (회차) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={session}
                    onChange={(e) => setSession(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                    required
                  />
                  <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                    차시
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 영역(교과) <span className="text-red-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Duration, Topic, Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 시간
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="예: 40분 (14:50~15:30)"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {['40분', '방과후 40분', '아침 30분', '80분(블록)'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDuration(preset)}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic (주제/단원) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 주제 및 단원 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="예: 자음과 모음의 결합 및 받침 없는 낱말 읽기"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Teaching Content (지도 내용) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  지도 내용 (학습 활동 및 지도 과정) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  구체적인 활동 순서와 지도 방법을 기재합니다.
                </span>
              </div>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="1. 자모 플래시 카드를 활용한 결합 원리 복습&#10;2. 받침 없는 낱말 소리내어 바르게 읽기 및 쓰기&#10;3. 형성평가 및 성취 확인"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
                required
              />
            </div>

            {/* Materials (교재 및 교구) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                활용 교재 및 교구
              </label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="예: 찬찬한글 1권 p.12~15, 수모형 세트, 워크시트"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Student Reaction & Achievement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Achievement Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  당일 성취도
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['상', '중', '하'] as AchievementLevel[]).map((level) => {
                    const isSelected = achievement === level;
                    const colors = {
                      상: isSelected ? 'bg-emerald-600 text-white font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50',
                      중: isSelected ? 'bg-amber-600 text-white font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50',
                      하: isSelected ? 'bg-rose-600 text-white font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50',
                    };
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setAchievement(level)}
                        className={`py-2 px-2 text-xs rounded-lg border text-center transition-all cursor-pointer ${colors[level]}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {achievement === '상' && '목표를 80% 이상 우수하게 달성함'}
                  {achievement === '중' && '도움을 받아 목표를 보통 수준으로 달성함'}
                  {achievement === '하' && '기초 개념 재지도 및 반복 연습 필요'}
                </p>
              </div>

              {/* Student Reaction */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학생 반응 및 지도 결과
                </label>
                <textarea
                  rows={2}
                  value={studentReaction}
                  onChange={(e) => setStudentReaction(e.target.value)}
                  placeholder="예: 손거울을 보며 입모양을 바르게 모으고, 낱말 카드 20개 중 18개를 정확하게 읽어내며 자신감을 표현함."
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Remarks (비고) & Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  비고 (특이사항 / 과제 / 다음 차시 계획)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="예: 가정 연계 복습 프린트 1장 배부. 다음 차시는 대표받침 지도 예정."
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 교사
                </label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {initialLog && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`'${initialLog.session}차시 (${initialLog.studentName})' 지도일지를 정말 삭제하시겠습니까?`)) {
                    onDelete(initialLog.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>일지 삭제</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              form="log-form"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialLog ? '수정 완료' : '일지 저장하기'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
