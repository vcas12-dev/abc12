import React from 'react';
import { 
  BookOpen, 
  Users, 
  Printer, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  GraduationCap,
  CalendarDays
} from 'lucide-react';
import { SchoolSettings } from '../types';

export type TabType = 'logs' | 'students' | 'print' | 'stats' | 'settings';

interface HeaderProps {
  settings: SchoolSettings;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNewLog: () => void;
  totalLogsCount: number;
  totalStudentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentTab,
  onTabChange,
  onOpenNewLog,
  totalLogsCount,
  totalStudentsCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'logs', label: '지도 일지 목록', icon: <BookOpen className="w-4 h-4" />, badge: totalLogsCount },
    { id: 'students', label: '학생 관리', icon: <Users className="w-4 h-4" />, badge: totalStudentsCount },
    { id: 'print', label: '공문서 인쇄·출력', icon: <Printer className="w-4 h-4" /> },
    { id: 'stats', label: '통계 및 진도 현황', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: '설정 및 백업', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top identity bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {settings.academicYear}학년도
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {settings.schoolName}
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-600">
                  담당: <strong className="font-semibold text-slate-800">{settings.teacherName}</strong> 교사
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {settings.programTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={onOpenNewLog}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새 지도일지 작성</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'text-indigo-700 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
