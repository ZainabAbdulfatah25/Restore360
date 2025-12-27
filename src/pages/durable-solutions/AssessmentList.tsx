import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Card, Button } from '../../components/common';
import { durableSolutionsApi } from '../../api';
import { DurableSolutionAssessment } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
    registrationId: string;
}

export const AssessmentList = ({ registrationId }: Props) => {
    const [assessments, setAssessments] = useState<DurableSolutionAssessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssessments();
    }, [registrationId]);

    const loadAssessments = async () => {
        try {
            const data = await durableSolutionsApi.getAssessmentsByRegistrationId(registrationId);
            setAssessments(data);
        } catch (err) {
            console.error('Failed to load assessments:', err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score <= 2) return 'text-red-600 bg-red-50 border-red-200';
        if (score >= 4) return 'text-green-600 bg-green-50 border-green-200';
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    };

    const ScoreBadge = ({ label, score }: { label: string, score: number }) => (
        <div className={`flex flex-col items-center p-2 rounded border ${getScoreColor(score)}`}>
            <span className="text-xs uppercase font-bold">{label}</span>
            <span className="text-xl font-bold">{score}</span>
        </div>
    );

    if (loading) return <div>Loading assessments...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Durable Solutions Progress</h3>
                <Link to={`/durable-solutions/new/${registrationId}`}>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Assessment
                    </Button>
                </Link>
            </div>

            {assessments.length === 0 ? (
                <Card>
                    <div className="p-8 text-center text-gray-500">
                        No assessments recorded yet. Start tracking progress by creating a new assessment.
                    </div>
                </Card>
            ) : (
                assessments.map((assessment) => (
                    <Card key={assessment.id} className="mb-4">
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-gray-600">
                                    Assessment Date: {new Date(assessment.assessment_date).toLocaleDateString()}
                                </span>
                                {assessment.next_followup_date && (
                                    <span className="text-sm text-blue-600">
                                        Next Follow-up: {new Date(assessment.next_followup_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <ScoreBadge label="Safety" score={assessment.safety_score} />
                                <ScoreBadge label="Housing" score={assessment.housing_score} />
                                <ScoreBadge label="Livelihood" score={assessment.livelihood_score} />
                                <ScoreBadge label="Social" score={assessment.social_cohesion_score} />
                                <ScoreBadge label="Services" score={assessment.access_to_services_score} />
                            </div>

                            {assessment.notes && (
                                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                                    <span className="font-semibold">Notes:</span> {assessment.notes}
                                </div>
                            )}
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};
