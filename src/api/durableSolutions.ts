import { supabase } from '../lib/supabase';
import { DurableSolutionAssessment } from '../types';

export const durableSolutionsApi = {
    async createAssessment(data: Omit<DurableSolutionAssessment, 'id' | 'created_at' | 'updated_at'>) {
        const { data: { user } } = await supabase.auth.getUser();

        const payload = {
            ...data,
            assessor_id: user?.id
        };

        const { data: assessment, error } = await supabase
            .from('durable_solutions_assessments')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return assessment;
    },

    async getAssessmentsByRegistrationId(registrationId: string) {
        const { data, error } = await supabase
            .from('durable_solutions_assessments')
            .select('*')
            .eq('registration_id', registrationId)
            .order('assessment_date', { ascending: false });

        if (error) throw error;
        return data as DurableSolutionAssessment[];
    },

    async getLatestAssessment(registrationId: string) {
        const { data, error } = await supabase
            .from('durable_solutions_assessments')
            .select('*')
            .eq('registration_id', registrationId)
            .order('assessment_date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Minimize error if no rows found
        return data as DurableSolutionAssessment | null;
    }
};
