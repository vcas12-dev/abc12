import React, { useState } from 'react';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  BookOpen, 
  PlusCircle, 
  Phone, 
  Target, 
  FileText, 
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { Student, TeachingLog } from '../types';
import { SUBJECT_OPTIONS } from '../utils/constants';

interface StudentManagerProps {
  students: Student[];
  logs: TeachingLog[];
  onSaveStudent: (student: Omit<Student, 'id' | 'createdAt'>, id?: string) => void;
  onDeleteStudent: (id: string) => void;
  onOpenNewLogForStudent: (studentId: string) => void;
  onViewLogsForStudent: (studentId: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  logs,
  onSaveStudent,
  onDeleteStudent,
  onOpenNewLogForStudent,
  onViewLogsForStudent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [grade, setGrade] = useState<number>(3);
  const [classNum, setClassNum] = useState<number>(1);
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [targetSessions, setTargetSessions] = useState<number>(20);
  const [initialDiagnosis, setInitialDiagnosis] = useState<string>('');
  const [learningGoal, setLearningGoal] = useState<string>('');
  const [guardianContact, setGuardianContact] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setGrade(3);
    setClassNum(1);
    setSubject(SUBJECT_OPTIONS[0]);
    setTargetSessions(20);
    setInitialDiagnosis('');
    setLearningGoal('');
    setGuardianContact('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setGrade(student.grade);
    setClassNum(student.classNum);
    setSubject(student.subject);
    setTargetSessions(student.targetSessions);
    setInitialDiagnosis(student.initialDiagnosis || '');
    setLearningGoal(student.learningGoal || '');
    setGuardianContact(student.guardianContact || '');
    setNotes(student.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    onSaveStudent(
      {
        name: name.trim(),
        grade: Number(grade) || 1,
        classNum: Number(classNum) || 1,
        subject,
        targetSessions: Number(targetSessions) || 20,
        initialDiagnosis: initialDiagnosis.trim(),
        learningGoal: learningGoal.trim(),
        guardianContact: guardianContact.trim(),
        status: 'active',
        notes: notes.trim(),
      },
      editingStudent?.id
    );

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            기초학력 지도 대상 학생 명단 ({students.length}명)
          </h2>
          <p className="text-xs text-slate-500">
            맞춤형 기초학력 책임지도를 진행하는 학생들의 프로필과 목표 차시를 관리합니다.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>신규 학생 등록</span>
        </button>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => {
          const studentLogs = logs.filter((l) => l.studentId === student.id);
          const completedCount = studentLogs.length;
          const progressPercent = Math.min(
            100,
            Math.round((completedCount / (student.targetSessions || 1)) * 100)
          );

          return (
            <div
              key={student.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Name, Grade/Class, Actions */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {student.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {student.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {student.grade}학년 {student.classNum}반
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="학생 정보 수정"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `'${student.name}' 학생을 명단에서 삭제하시겠습니까? (작성된 일지는 보존됩니다)`
                          )
                        ) {
                          onDeleteStudent(student.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                      title="학생 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subject & Progress */}
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {student.subject}
                    </span>
                    <span className="text-slate-600 font-medium">
                      진도율: <strong className="text-slate-900">{progressPercent}%</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>완료: {completedCount}차시</span>
                      <span>목표: {student.targetSessions}차시</span>
                    </div>
                  </div>

                  {/* Diagnosis & Goal */}
                  {student.initialDiagnosis && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                        초기 진단 현황
                      </div>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">
                        {student.initialDiagnosis}
                      </p>
                    </div>
                  )}

                  {student.learningGoal && (
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-700 font-semibold">지도 목표: </strong>
                      <span>{student.learningGoal}</span>
                    </div>
                  )}

                  {student.guardianContact && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{student.guardianContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewLogsForStudent(student.id)}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>일지 보기 ({completedCount})</span>
                </button>
                <button
                  onClick={() => onOpenNewLogForStudent(student.id)}
                  className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>새 일지 작성</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? '학생 정보 수정' : '기초학력 지도 학생 등록'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    학년
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    반
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={classNum}
                    onChange={(e) => setClassNum(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    지도 영역(교과)
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    목표 차시
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetSessions}
                    onChange={(e) => setTargetSessions(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  초기 진단 결과 / 미도달 영역
                </label>
                <textarea
                  rows={2}
                  value={initialDiagnosis}
                  onChange={(e) => setInitialDiagnosis(e.target.value)}
                  placeholder="예: 복합 받침 낱말 해득 미도달, 연산 10의 보수 개념 불완전 등"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  지도 목표
                </label>
                <input
                  type="text"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="예: 3학년 수준 줄글 80% 이상 독해 및 바른 쓰기"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    보호자 연락처
                  </label>
                  <input
                    type="text"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    특이사항/참고사항
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="예: 시각 자료 활용 시 집중도 우수"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
                >
                  {editingStudent ? '수정 저장' : '학생 추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
