export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'case_worker' | 'field_officer' | 'viewer' | 'organization';
  phone?: string;
  department?: string;
  organization_name?: string;
  organization_type?: string;
  description?: string;
  status: 'active' | 'inactive';
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assigned_to?: string;
  assigned_user?: User;
  created_by: string;
  creator?: User;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  id_number?: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  category: string;
  description: string;
  attachments?: Attachment[];
  status: 'pending' | 'approved' | 'rejected';
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  household_size?: number;
  household_head?: string;
  qr_code?: string;
  photo_url?: string;
  temporary_restore_id?: string;
  has_nin?: boolean;
  nimc_referral_status?: string;
  alternative_contact?: string;
  is_head_of_household?: boolean;
  nationality?: string;
  ethnicity?: string;
  religion?: string;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  disabilities?: string[];
  medical_conditions?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  displacement_status?: string;
  displacement_date?: string;
  community_of_origin?: string;
  lga_of_origin?: string;
  displacement_cause?: string;
  perpetrating_actor?: string;
  displacement_frequency?: string;
  current_location_details?: any;
  intention?: string;
  intention_reason?: string;
  place_of_origin?: string;
  place_of_origin_district?: string;
  place_of_origin_region?: string;
  current_location?: string;
  current_location_district?: string;
  current_location_region?: string;
  displacement_reason?: string;
  displacement_duration?: string;
  previous_displacements?: Array<{
    location: string;
    date: string;
    duration: string;
    reason: string;
  }>;
  shelter_type?: string;
  has_documentation?: boolean;
  documentation_types?: string[];
  nin_document_url?: string;
  voter_id_url?: string;
  birth_certificate_url?: string;
  idp_certificate_url?: string;
  other_documents?: any[];
  previous_occupation?: string;
  skill_level?: string;
  current_livelihood_status?: string;
  assets_lost?: string[];
  livelihood_assistance_interests?: string[];
  safety_perception?: string;
  eviction_risk?: string;
  has_complaint_mechanism_access?: boolean;
  disability_types?: string[];
  chronic_illness?: string;
  is_pregnant?: boolean;
  is_lactating?: boolean;
  is_elderly?: boolean;
  is_female_headed_household?: boolean;
  has_unaccompanied_minors?: boolean;
  gbv_risk_level?: string;
  assigned_organization?: string;
  organization_contact?: string;
  assignment_date?: string;
}

export interface ServiceHistory {
  id: string;
  registration_id: string;
  service_type: string;
  provider_organization: string;
  service_date: string;
  frequency?: string;
  description?: string;
  satisfaction_rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceNeed {
  id: string;
  registration_id: string;
  need_category: string;
  need_description: string;
  is_urgent: boolean;
  urgency_hours?: number;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  fulfilled_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DurableSolutionsFollowup {
  id: string;
  registration_id: string;
  followup_date: string;
  followup_period: string;
  current_location?: string;
  location_stability?: string;
  livelihood_status?: string;
  income_level?: string;
  housing_conditions?: string;
  access_to_services?: any;
  safety_security_status?: string;
  integration_level?: string;
  return_likelihood?: string;
  challenges_faced?: string[];
  support_received?: string[];
  additional_needs?: string[];
  durable_solution_achieved?: boolean;
  solution_type?: string;
  recommendations?: string;
  next_followup_date?: string;
  conducted_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface Referral {
  id: string;
  referral_number?: string;
  case_id?: string;
  referred_from: string;
  referred_to: string;
  from_user?: User;
  to_user?: User;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user?: User;
  action: string;
  module: string;
  description: string;
  device_id?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  total_cases: number;
  open_cases: number;
  closed_cases: number;
  total_users: number;
  total_registrations: number;
  pending_referrals: number;
  recent_activity: ActivityLog[];
}

export interface ReportData {
  id: string;
  report_type: string;
  generated_by: string;
  date_range: {
    start: string;
    end: string;
  };
  data: Record<string, any>;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
