import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, BarChart3, FileText } from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Input, Select, BackToDashboard } from '../../components/common';
import { useActivityLogger } from '../../hooks';
import { reportsApi } from '../../api';

interface ReportFormData {
  report_type: string;
  start_date: string;
  end_date: string;
  format: 'pdf' | 'excel' | 'csv';
}

export const ReportsPage = () => {
  const [generating, setGenerating] = useState(false);
  const { track } = useActivityLogger();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>();

  const onSubmit = async (data: ReportFormData) => {
    try {
      setGenerating(true);
      await track('generate', 'reports', `Generating ${data.report_type} report`);

      const blob = await reportsApi.exportReport(data.report_type, {
        start_date: data.start_date,
        end_date: data.end_date,
        format: data.format,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.report_type}_report_${new Date().toISOString().split('T')[0]}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      await track('export', 'reports', `Exported ${data.report_type} report as ${data.format}`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    {
      title: 'Cases Summary',
      description: 'Overview of all cases by status, priority, and assignment',
      value: 'cases_summary',
      icon: FileText,
    },
    {
      title: 'User Activity',
      description: 'Detailed activity logs for all users',
      value: 'user_activity',
      icon: BarChart3,
    },
    {
      title: 'Registrations Report',
      description: 'Summary of all registration submissions',
      value: 'registrations',
      icon: FileText,
    },
    {
      title: 'Referrals Report',
      description: 'Overview of referrals between users',
      value: 'referrals',
      icon: FileText,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export system reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((type) => (
            <Card key={type.value}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <type.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Generate Report">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <Select
              label="Report Type"
              options={[
                { value: '', label: 'Select report type' },
                ...reportTypes.map((t) => ({ value: t.value, label: t.title })),
              ]}
              error={errors.report_type?.message}
              {...register('report_type', { required: 'Report type is required' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                error={errors.start_date?.message}
                {...register('start_date', { required: 'Start date is required' })}
              />

              <Input
                label="End Date"
                type="date"
                error={errors.end_date?.message}
                {...register('end_date', { required: 'End date is required' })}
              />
            </div>

            <Select
              label="Export Format"
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'excel', label: 'Excel' },
                { value: 'csv', label: 'CSV' },
              ]}
              error={errors.format?.message}
              {...register('format', { required: 'Format is required' })}
            />

            <Button type="submit" isLoading={generating}>
              <Download className="w-4 h-4 mr-2" />
              Generate & Download Report
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};
