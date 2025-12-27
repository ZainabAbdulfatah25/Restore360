import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '../../components/common';
import { durableSolutionsApi } from '../../api';
import { useActivityLogger } from '../../hooks';
import { useParams, useNavigate } from 'react-router-dom';

interface AssessmentFormData {
    safety_score: number;
    housing_score: number;
    livelihood_score: number;
    social_cohesion_score: number;
    access_to_services_score: number;
    notes: string;
    next_followup_date: string;
}

export const AssessmentForm = () => {
    const { registrationId } = useParams();
    const navigate = useNavigate();
    const { track } = useActivityLogger();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AssessmentFormData>({
        defaultValues: {
            safety_score: 3,
            housing_score: 3,
            livelihood_score: 3,
            social_cohesion_score: 3,
            access_to_services_score: 3,
        }
    });

    const onSubmit = async (data: AssessmentFormData) => {
        if (!registrationId) return;

        try {
            setError('');
            await durableSolutionsApi.createAssessment({
                registration_id: registrationId,
                assessment_date: new Date().toISOString(),
                ...data
            });

            await track('create', 'assessments', 'Created durable solutions assessment');
            navigate(-1); // Go back
        } catch (err: any) {
            console.error('Assessment creation error:', err);
            setError(err.message || 'Failed to save assessment');
        }
    };

    const ScoreInput = ({ name, label, description }: { name: keyof AssessmentFormData, label: string, description: string }) => {
        const value = watch(name) as number;
        let colorClass = 'bg-yellow-500';
        if (value <= 2) colorClass = 'bg-red-500';
        if (value >= 4) colorClass = 'bg-green-500';

        return (
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                    <label className="font-medium text-gray-900">{label}</label>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${colorClass}`}>
                        Score: {value}
                    </span>
                </div>
                <p className="text-sm text-gray-500">{description}</p>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">Critical (1)</span>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        {...register(name, { valueAsNumber: true })}
                    />
                    <span className="text-xs text-gray-500">Sustainable (5)</span>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">New Assessment</h1>
                <p className="text-gray-600 mt-1">Evaluate progress towards durable solutions</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <ScoreInput
                            name="safety_score"
                            label="Safety & Security"
                            description="Freedom from physical injury, harassment, and persecution."
                        />
                        <ScoreInput
                            name="housing_score"
                            label="Standard of Living (Housing)"
                            description="Access to adequate housing, water, sanitation, and health care."
                        />
                        <ScoreInput
                            name="livelihood_score"
                            label="Livelihood & Employment"
                            description="Access to employment and income-generating opportunities."
                        />
                        <ScoreInput
                            name="social_cohesion_score"
                            label="Social Rehab & Cohesion"
                            description="Restoration of community ties and access to justice."
                        />
                        <ScoreInput
                            name="access_to_services_score"
                            label="Access to Documentation"
                            description="Possession of ID cards, birth certificates, and other documents."
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">General Notes</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Additional observations..."
                                {...register('notes')}
                            />
                        </div>

                        <Input
                            label="Next Follow-up Date"
                            type="date"
                            {...register('next_followup_date')}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="submit" isLoading={isSubmitting}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Assessment
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
