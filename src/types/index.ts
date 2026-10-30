export type UserRole = 'inspector' | 'supervisor' | 'admin';
export type InspectionDomain = 'manufacturing' | 'safety' | 'infrastructure' | 'document';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type InspectionStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionProfile {
  id: string;
  user_id: string;
  name: string;
  domain: InspectionDomain;
  description: string;
  custom_rules: {
    sensitivity?: 'standard' | 'high' | 'ultra';
    focus_areas?: string[];
    min_confidence?: number;
    require_remediation?: boolean;
    custom_prompt?: string;
  };
  created_at: string;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  confidence: number;
  severity?: SeverityLevel;
  category?: string;
  boundingBox?: BoundingBox;
}

export interface InspectionAIResponse {
  status: 'PASSED' | 'FAILED' | 'WARNING';
  overallScore: number;
  severity: SeverityLevel;
  summary: string;
  anomalies: Array<{
    title: string;
    description: string;
    confidence: number;
    boundingBox?: BoundingBox;
  }>;
  recommendations: string[];
}

export interface Inspection {
  id: string;
  user_id: string;
  title: string;
  domain: InspectionDomain;
  image_url: string;
  status: InspectionStatus;
  severity: SeverityLevel;
  overall_score: number;
  priority?: SeverityLevel;
  notes?: string;
  ai_raw_response?: InspectionAIResponse | null;
  anomalies_detected: Anomaly[];
  recommendations: string[];
  created_at: string;
  updated_at: string;
}
