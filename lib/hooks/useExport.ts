// Hook for exporting workouts, templates, and weekly summaries

import { useState } from 'react';
import {
  generateWorkoutCSV,
  generateWorkoutPDF,
  generateTemplateCSV,
  generateTemplatePDF,
  generateWeeklySummaryCSV,
  generateWeeklySummaryPDF,
  downloadFile,
  generateFilename,
} from '@/lib/utils/export-generators';
import type { ExportWorkout, ExportTemplate, ExportWeeklySummary, ExportFormat } from '@/lib/types/export';

export function useExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Export a single workout
   */
  const exportWorkout = async (workoutId: string, format: ExportFormat) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch workout data from API
      const response = await fetch(`/api/export/workout/${workoutId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to export workout' }));
        throw new Error(data.error || 'Failed to export workout');
      }

      const workout: ExportWorkout = await response.json();

      // Generate file
      if (format === 'csv') {
        const csv = generateWorkoutCSV(workout);
        const filename = generateFilename('workout', 'csv', workout.title);
        downloadFile(csv, filename);
      } else {
        const pdf = generateWorkoutPDF(workout);
        const filename = generateFilename('workout', 'pdf', workout.title);
        downloadFile(pdf.output('blob'), filename);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export workout';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export a workout template
   */
  const exportTemplate = async (templateId: string, format: ExportFormat) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch template data from API
      const response = await fetch(`/api/export/template/${templateId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to export template' }));
        throw new Error(data.error || 'Failed to export template');
      }

      const template: ExportTemplate = await response.json();

      // Generate file
      if (format === 'csv') {
        const csv = generateTemplateCSV(template);
        const filename = generateFilename('template', 'csv', template.name);
        downloadFile(csv, filename);
      } else {
        const pdf = generateTemplatePDF(template);
        const filename = generateFilename('template', 'pdf', template.name);
        downloadFile(pdf.output('blob'), filename);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export template';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export weekly summary
   */
  const exportWeeklySummary = async (weekStart: string, weekEnd: string, format: ExportFormat) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch weekly data from API
      const params = new URLSearchParams({ week_start: weekStart, week_end: weekEnd });
      const response = await fetch(`/api/export/weekly?${params}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to export weekly summary' }));
        throw new Error(data.error || 'Failed to export weekly summary');
      }

      const summary: ExportWeeklySummary = await response.json();

      // Generate file
      if (format === 'csv') {
        const csv = generateWeeklySummaryCSV(summary);
        const filename = generateFilename('weekly', 'csv', `${weekStart}_to_${weekEnd}`);
        downloadFile(csv, filename);
      } else {
        const pdf = generateWeeklySummaryPDF(summary);
        const filename = generateFilename('weekly', 'pdf', `${weekStart}_to_${weekEnd}`);
        downloadFile(pdf.output('blob'), filename);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export weekly summary';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    exportWorkout,
    exportTemplate,
    exportWeeklySummary,
  };
}

