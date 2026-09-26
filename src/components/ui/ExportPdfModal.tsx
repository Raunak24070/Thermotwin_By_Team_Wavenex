'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { Download, FileText } from 'lucide-react';
import { ExperimentSubmissionResult } from '@/types/db';

interface ExportPdfModalProps {
  submission: ExperimentSubmissionResult;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({ submission }) => {

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header Title
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('THERMOTWIN VIRTUAL LABORATORY REPORT', 14, 20);

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Experiment: Determination of Thermal Conductivity of a Metallic Rod', 14, 28);

    // Metadata Table
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. STUDENT & SESSION DETAILS', 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${submission.studentName}`, 14, 56);
    doc.text(`Student ID: ${submission.studentId}`, 14, 62);
    doc.text(`Session ID: ${submission.sessionId}`, 110, 56);
    doc.text(`Submitted At: ${submission.submittedAt}`, 110, 62);

    // Apparatus Parameters
    doc.setFont('helvetica', 'bold');
    doc.text('2. APPARATUS SETUP & SENSOR DATA', 14, 75);

    doc.setFont('helvetica', 'normal');
    doc.text(`Material: ${submission.materialName}`, 14, 83);
    doc.text(`Heater Voltage: ${submission.voltage} V`, 14, 89);
    doc.text(`Heater Current: ${submission.current} A`, 14, 95);
    doc.text(`Heat Power (P): ${submission.power} W`, 14, 101);

    doc.text(`Water Flow Rate: ${submission.waterFlowLmin} L/min`, 110, 83);
    doc.text(`Water Inlet (T8): ${submission.t8} °C`, 110, 89);
    doc.text(`Water Outlet (T9): ${submission.t9} °C`, 110, 95);
    doc.text(`Time to Steady State: ${submission.timeToSteadyStateSec} seconds`, 110, 101);

    // Thermocouple Readings T1 - T7
    doc.setFont('helvetica', 'bold');
    doc.text('Thermocouple Readings Along Rod (T1 – T7):', 14, 112);
    doc.setFont('helvetica', 'normal');
    doc.text(`T1: ${submission.t1}°C  |  T2: ${submission.t2}°C  |  T3: ${submission.t3}°C  |  T4: ${submission.t4}°C`, 14, 120);
    doc.text(`T5: ${submission.t5}°C  |  T6: ${submission.t6}°C  |  T7: ${submission.t7}°C`, 14, 126);

    // Calculations & Results
    doc.setFont('helvetica', 'bold');
    doc.text('3. FOURIER ANALYSIS & CALCULATIONS', 14, 140);

    doc.setFont('helvetica', 'normal');
    doc.text(`Temperature Gradient (|dT/dx|): ${submission.tempGradient} °C/m`, 14, 148);
    doc.text(`Experimental Conductance (k_exp): ${submission.experimentalK} W/(m·K)`, 14, 154);
    doc.text(`Theoretical Reference (k_ref): ${submission.referenceK} W/(m·K)`, 14, 160);
    doc.text(`Percentage Error: ${submission.percentageError}%`, 14, 166);

    // Teacher Review & Feedback
    if (submission.teacherFeedback) {
      doc.setFont('helvetica', 'bold');
      doc.text('4. INSTRUCTOR REVIEW & FEEDBACK', 14, 180);
      doc.setFont('helvetica', 'normal');
      doc.text(`Graded By: ${submission.gradedBy || 'Instructor'} (${submission.reviewedAt || ''})`, 14, 188);
      doc.text(`Feedback: ${submission.teacherFeedback}`, 14, 194, { maxWidth: 180 });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ThermoTwin Web — Interactive 3D Virtual Physics Laboratory Platform', 14, 280);

    doc.save(`ThermoTwin_Report_${submission.studentName.replace(/\s+/g, '_')}_${submission.sessionId}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow transition-all"
    >
      <FileText className="w-4 h-4 text-amber-400" />
      Export PDF Report
    </button>
  );
};
