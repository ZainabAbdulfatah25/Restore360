import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, BarChart3, FileText, TrendingUp, Users, FolderOpen, ArrowRightLeft } from 'lucide-react';
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
  const [reportPreview, setReportPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { track } = useActivityLogger();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      format: 'csv'
    }
  });

  const selectedReportType = watch('report_type');
  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const handlePreview = async () => {
    if (!selectedReportType || !startDate || !endDate) return;

    setPreviewLoading(true);
    try {
      const report = await reportsApi.generateReport(selectedReportType, {
        start_date: startDate,
        end_date: endDate,
      });
      setReportPreview(report);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

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
      icon: FolderOpen,
      color: 'blue',
    },
    {
      title: 'User Activity',
      description: 'Detailed activity logs for all users',
      value: 'user_activity',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Registrations Report',
      description: 'Summary of all registration submissions',
      value: 'registrations',
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Referrals Report',
      description: 'Overview of referrals between users',
      value: 'referrals',
      icon: ArrowRightLeft,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <BackToDashboard />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive reports and download data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const colors = getColorClasses(type.color);
            const isSelected = selectedReportType === type.value;

            return (
              <Card key={type.value}>
                <div className={`p-6 cursor-pointer transition-all hover:shadow-lg ${isSelected ? `border-2 ${colors.border}` : ''}`}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 ${colors.bg} rounded-lg mb-3`}>
                      <type.icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
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
                { value: 'csv', label: 'CSV (Recommended)' },
                { value: 'excel', label: 'Excel' },
                { value: 'pdf', label: 'PDF' },
              ]}
              error={errors.format?.message}
              {...register('format', { required: 'Format is required' })}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreview}
                isLoading={previewLoading}
                disabled={!selectedReportType || !startDate || !endDate}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Preview Report
              </Button>

              <Button type="submit" isLoading={generating}>
                <Download className="w-4 h-4 mr-2" />
                Generate & Download
              </Button>
            </div>
          </form>
        </Card>

        {reportPreview && (
          <Card title={`Report Preview: ${reportTypes.find(t => t.value === reportPreview.report_type)?.title}`}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Report Type</p>
                  <p className="text-lg font-semibold text-gray-900">{reportPreview.report_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Range</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(reportPreview.start_date).toLocaleDateString()} - {new Date(reportPreview.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-lg font-semibold text-gray-900">{reportPreview.data.total || 0}</p>
                </div>
              </div>

              {reportPreview.report_type === 'cases_summary' && reportPreview.data.statusBreakdown && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(reportPreview.data.statusBreakdown).map(([status, count]: [string, any]) => (
                      <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">{status}</p>
                      </div>
                    ))}
                  </div>
                  {reportPreview.data.priorityBreakdown && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Priority Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(reportPreview.data.priorityBreakdown).map(([priority, count]: [string, any]) => (
                          <div key={priority} className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-sm text-gray-600 capitalize">{priority}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {reportPreview.report_type === 'registrations' && reportPreview.data.statusBreakdown && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(reportPreview.data.statusBreakdown).map(([status, count]: [string, any]) => (
                      <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">{status}</p>
                      </div>
                    ))}
                  </div>
                  {reportPreview.data.categoryBreakdown && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Category Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(reportPreview.data.categoryBreakdown).map(([category, count]: [string, any]) => (
                          <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-sm text-gray-600 capitalize">{category}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {reportPreview.report_type === 'referrals' && reportPreview.data.statusBreakdown && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Referral Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(reportPreview.data.statusBreakdown).map(([status, count]: [string, any]) => (
                      <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">{status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportPreview.report_type === 'user_activity' && Array.isArray(reportPreview.data) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activities ({reportPreview.data.length})</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {reportPreview.data.slice(0, 10).map((activity: any, index: number) => (
                      <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{activity.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">
                          {activity.action} - {activity.entity_type} - {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Click "Generate & Download" above to export this report in your selected format.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
