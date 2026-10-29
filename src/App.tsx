/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { LogList } from './components/LogList';
import { LogModal } from './components/LogModal';
import { StudentManager } from './components/StudentManager';
import { PrintReportView } from './components/PrintReportView';
import { StatsOverview } from './components/StatsOverview';
import { SettingsView } from './components/SettingsView';
import { SchoolSettings, Student, TeachingLog } from './types';
import {
  exportLogsToCSV,
  loadLogs,
  loadSettings,
  loadStudents,
  saveLogs,
  saveSettings,
  saveStudents,
} from './utils/storage';

export default function App() {
  const [settings, setSettings] = useState<SchoolSettings>(loadSettings);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [logs, setLogs] = useState<TeachingLog[]>(loadLogs);

  const [currentTab, setCurrentTab] = useState<TabType>('logs');

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<TeachingLog | null>(null);

  // Print view student selection
  const [targetPrintStudentId, setTargetPrintStudentId] = useState<string | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // Log handlers
  const handleOpenNewLog = () => {
    setEditingLog(null);
    setIsLogModalOpen(true);
  };

  const handleEditLog = (log: TeachingLog) => {
    setEditingLog(log);
    setIsLogModalOpen(true);
  };

  const handleDuplicateLog = (log: TeachingLog) => {
    // Clone with incremented session and current date
    const targetStudentLogs = logs.filter((l) => l.studentId === log.studentId);
    const maxSession = targetStudentLogs.reduce((max, l) => Math.max(max, l.session), 0);
    const nextSession = Math.max(maxSession + 1, log.session + 1);

    const duplicated: TeachingLog = {
      ...log,
      id: '',
      date: new Date().toISOString().slice(0, 10),
      session: nextSession,
      topic: `${log.topic} (연계)`,
      studentReaction: '',
      remarks: '',
      createdAt: '',
      updatedAt: '',
    };
    setEditingLog(duplicated);
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (
    logData: Omit<TeachingLog, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    const timestamp = new Date().toISOString();
    if (id) {
      // Edit existing log
      setLogs((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...logData,
                id,
                createdAt: l.createdAt,
                updatedAt: timestamp,
              }
            : l
        )
      );
    } else {
      // Add new log
      const newLog: TeachingLog = {
        ...logData,
        id: `log-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Student handlers
  const handleSaveStudent = (
    studentData: Omit<Student, 'id' | 'createdAt'>,
    id?: string
  ) => {
    if (id) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...studentData, id, createdAt: s.createdAt } : s))
      );
      // Also update studentName in logs if name changed
      setLogs((prev) =>
        prev.map((l) =>
          l.studentId === id ? { ...l, studentName: studentData.name } : l
        )
      );
    } else {
      const newStudent: Student = {
        ...studentData,
        id: `student-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setStudents((prev) => [...prev, newStudent]);
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleOpenNewLogForStudent = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const studentLogs = logs.filter((l) => l.studentId === studentId);
    const maxSession = studentLogs.reduce((max, l) => Math.max(max, l.session), 0);

    const emptyLogForStudent: TeachingLog = {
      id: '',
      studentId: st.id,
      studentName: st.name,
      date: new Date().toISOString().slice(0, 10),
      session: maxSession + 1,
      duration: '40분 (14:50~15:30)',
      subject: st.subject,
      topic: '',
      content: '',
      studentReaction: '',
      achievement: '중',
      remarks: '',
      teacher: settings.teacherName,
      createdAt: '',
      updatedAt: '',
    };
    setEditingLog(emptyLogForStudent);
    setIsLogModalOpen(true);
  };

  const handleViewLogsForStudent = (studentId: string) => {
    setCurrentTab('logs');
  };

  const handleSelectStudentForPrint = (studentId?: string) => {
    setTargetPrintStudentId(studentId);
    setCurrentTab('print');
  };

  const handleDataReset = (
    newSettings: SchoolSettings,
    newStudents: Student[],
    newLogs: TeachingLog[]
  ) => {
    setSettings(newSettings);
    setStudents(newStudents);
    setLogs(newLogs);
  };

  const handleDataImport = (imported: {
    settings?: SchoolSettings;
    students?: Student[];
    logs?: TeachingLog[];
  }) => {
    if (imported.settings) setSettings(imported.settings);
    if (imported.students) setStudents(imported.students);
    if (imported.logs) setLogs(imported.logs);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top App Bar & Navigation */}
      <Header
        settings={settings}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewLog={handleOpenNewLog}
        totalLogsCount={logs.length}
        totalStudentsCount={students.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'logs' && (
          <LogList
            logs={logs}
            students={students}
            onOpenNewLog={handleOpenNewLog}
            onEditLog={handleEditLog}
            onDuplicateLog={handleDuplicateLog}
            onDeleteLog={handleDeleteLog}
            onSelectStudentForPrint={handleSelectStudentForPrint}
            onExportCSV={() => exportLogsToCSV(logs, students)}
          />
        )}

        {currentTab === 'students' && (
          <StudentManager
            students={students}
            logs={logs}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenNewLogForStudent={handleOpenNewLogForStudent}
            onViewLogsForStudent={handleViewLogsForStudent}
          />
        )}

        {currentTab === 'print' && (
          <PrintReportView
            settings={settings}
            students={students}
            logs={logs}
            initialStudentId={targetPrintStudentId}
            onBack={() => setCurrentTab('logs')}
          />
        )}

        {currentTab === 'stats' && (
          <StatsOverview students={students} logs={logs} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={setSettings}
            students={students}
            logs={logs}
            onDataReset={handleDataReset}
            onDataImport={handleDataImport}
          />
        )}
      </main>

      {/* Footer (No-print) */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{settings.schoolName}</strong> {settings.academicYear}학년도 기초학력 보정 및 맞춤형 책임지도 지원 시스템
          </div>
          <div className="flex items-center gap-3">
            <span>담당교사: {settings.teacherName}</span>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('print')}
              className="hover:underline text-indigo-600 cursor-pointer"
            >
              공문서 서식 인쇄
            </button>
            <span>•</span>
            <button
              onClick={() => exportLogsToCSV(logs, students)}
              className="hover:underline text-emerald-600 cursor-pointer"
            >
              엑셀 다운로드
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Teaching Log Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        onDelete={handleDeleteLog}
        initialLog={editingLog}
        students={students}
        allLogs={logs}
        defaultTeacherName={settings.teacherName}
      />
    </div>
  );
}
