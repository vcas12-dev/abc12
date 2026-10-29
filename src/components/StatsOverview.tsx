import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Users, 
  BookCheck, 
  TrendingUp, 
  Award,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Student, TeachingLog } from '../types';

interface StatsOverviewProps {
  students: Student[];
  logs: TeachingLog[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ students, logs }) => {
  // Aggregate stats
  const totalSessions = logs.length;
  const totalStudents = students.length;

  // Approximate total hours (assuming ~40 minutes per session on average)
  const estimatedTotalMinutes = totalSessions * 40;
  const totalHours = Math.floor(estimatedTotalMinutes / 60);
  const remainingMinutes = estimatedTotalMinutes % 60;

  // Achievement distribution
  const achievementCounts = {
    상: logs.filter((l) => l.achievement === '상').length,
    중: logs.filter((l) => l.achievement === '중').length,
    하: logs.filter((l) => l.achievement === '하').length,
  };

  // Subject distribution
  const subjectCounts: Record<string, number> = {};
  logs.forEach((l) => {
    subjectCounts[l.subject] = (subjectCounts[l.subject] || 0) + 1;
  });

  // Target progress
  const totalTargetSessions = students.reduce((acc, s) => acc + (s.targetSessions || 20), 0);
  const overallProgressPercent = totalTargetSessions > 0 
    ? Math.min(100, Math.round((totalSessions / totalTargetSessions) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">총 지도 차시</span>
            <BookCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalSessions} <span className="text-xs font-normal text-slate-500">차시 완료</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            전체 계획 대비 약 {overallProgressPercent}% 진행
          </p>
        </div>

        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">지도 대상 학생</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalStudents} <span className="text-xs font-normal text-slate-500">명 관리 중</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            학생 1인당 평균 {totalStudents > 0 ? (totalSessions / totalStudents).toFixed(1) : 0}회 지도
          </p>
        </div>

        {/* Total Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">누적 지도 시간</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalHours}시간 {remainingMinutes > 0 ? `${remainingMinutes}분` : ''}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            차시당 40분 기준 환산 총 {estimatedTotalMinutes}분
          </p>
        </div>

        {/* High Achievement Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">우수 성취율 (상)</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalSessions > 0
              ? Math.round((achievementCounts['상'] / totalSessions) * 100)
              : 0}
            %
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            우수 {achievementCounts['상']}건 / 보통 {achievementCounts['중']}건
          </p>
        </div>
      </div>

      {/* Charts / Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>교과 및 지도 영역별 비중</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(subjectCounts).length === 0 ? (
              <p className="text-xs text-slate-400">데이터가 없습니다.</p>
            ) : (
              Object.entries(subjectCounts).map(([subj, count]) => {
                const percent = Math.round((count / (totalSessions || 1)) * 100);
                return (
                  <div key={subj} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{subj}</span>
                      <span className="text-slate-500">
                        {count}차시 ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Achievement Level Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>학습 성취도 분포 현황</span>
          </h3>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-center">
              <span className="text-xs font-bold text-emerald-800 block mb-1">상 (우수)</span>
              <div className="text-xl font-bold text-emerald-700">
                {achievementCounts['상']}
                <span className="text-xs font-normal ml-0.5">건</span>
              </div>
              <span className="text-[11px] text-emerald-600">
                {totalSessions > 0
                  ? Math.round((achievementCounts['상'] / totalSessions) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-center">
              <span className="text-xs font-bold text-amber-800 block mb-1">중 (보통)</span>
              <div className="text-xl font-bold text-amber-700">
                {achievementCounts['중']}
                <span className="text-xs font-normal ml-0.5">건</span>
              </div>
              <span className="text-[11px] text-amber-600">
                {totalSessions > 0
                  ? Math.round((achievementCounts['중'] / totalSessions) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-center">
              <span className="text-xs font-bold text-rose-800 block mb-1">하 (노력)</span>
              <div className="text-xl font-bold text-rose-700">
                {achievementCounts['하']}
                <span className="text-xs font-normal ml-0.5">건</span>
              </div>
              <span className="text-[11px] text-rose-600">
                {totalSessions > 0
                  ? Math.round((achievementCounts['하'] / totalSessions) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            * '중' 또는 '하'로 기록된 차시는 구체물 조작 및 보충 학습 자료를 재구성하여 차기 차시에 복습하도록 연계하고 있습니다.
          </p>
        </div>
      </div>

      {/* Student by Student Progress Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            학생별 목표 대비 지도 진도표
          </h3>
          <span className="text-xs text-slate-500">
            책임지도 목표 달성 여부 점검
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2.5 px-4">학생명</th>
                <th className="py-2.5 px-3">학년/반</th>
                <th className="py-2.5 px-3">중점 과목</th>
                <th className="py-2.5 px-4 min-w-[200px]">진도 달성률</th>
                <th className="py-2.5 px-3 text-center">완료 / 목표</th>
                <th className="py-2.5 px-3">최근 지도일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((st) => {
                const studentLogs = logs
                  .filter((l) => l.studentId === st.id)
                  .sort((a, b) => b.date.localeCompare(a.date));
                const completed = studentLogs.length;
                const percent = Math.min(
                  100,
                  Math.round((completed / (st.targetSessions || 1)) * 100)
                );
                const lastLog = studentLogs[0];

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {st.grade}학년 {st.classNum}반
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{st.subject}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              percent >= 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-10 text-right">
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {completed} / {st.targetSessions}차시
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {lastLog ? (
                        <span>
                          {lastLog.date} ({lastLog.session}차시)
                        </span>
                      ) : (
                        <span className="text-slate-400">기록 없음</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
