export interface Student {
  id: string;
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: Date;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  pdfPath: string;
}

export interface TraitProfile {
  name: string;
  label: string;
  score: number;
  percentage: number;
  color: string;
  description: string;
  strengths: string[];
  careers: string[];
}

export interface ReportData {
  student: Student;
  traits: TraitProfile[];
  dominant: TraitProfile;
  secondary: TraitProfile;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface StudentLoginPayload {
  mobile: string;
}

export interface UploadPayload {
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
