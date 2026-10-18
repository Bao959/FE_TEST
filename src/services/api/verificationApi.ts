/**
 * Chạm Đũa - Verification & Education API
 * Endpoints: /api/verification/*, /api/education/*
 */
import { apiClient } from './client';

export interface VerificationStatus {
  isEmailVerified: boolean;
  email?: string;
  isPhoneVerified: boolean;
  phone?: string;
  isStudentVerified?: boolean;
  studentEmail?: string;
  universityName?: string;
}

export interface CountryPhone {
  countryCode: string;
  callingCode: string;
  name?: string;
}

export interface EducationOrg {
  orgId: number;
  name: string;
  domain: string;
  logoUrl?: string;
}

export const verificationApi = {
  // Verification status
  getStatus: async () => {
    return apiClient.get<VerificationStatus>('/api/verification/status');
  },

  // Calling code countries
  getCountries: async () => {
    return apiClient.get<CountryPhone[]>('/api/verification/countries');
  },

  // Request Email OTP
  requestEmailOtp: async (email: string) => {
    return apiClient.post('/api/verification/email/request', { email });
  },

  // Confirm Email OTP
  confirmEmailOtp: async (otp: string) => {
    return apiClient.post('/api/verification/email/confirm', { otp });
  },

  // Request Phone OTP
  requestPhoneOtp: async (phone: string) => {
    return apiClient.post('/api/verification/phone/request', { phone });
  },

  // Confirm Phone OTP
  confirmPhoneOtp: async (otp: string) => {
    return apiClient.post('/api/verification/phone/confirm', { otp });
  },

  // Education & University verification
  getEducationOrganizations: async () => {
    return apiClient.get<EducationOrg[]>('/api/education/organizations');
  },

  getEducationStatus: async (orgId: number) => {
    return apiClient.get(`/api/education/status?orgId=${orgId}`);
  },

  requestEducationOtp: async (orgId: number, studentEmail: string) => {
    return apiClient.post('/api/education/request-otp', { orgId, email: studentEmail });
  },

  confirmEducationOtp: async (orgId: number, otp: string) => {
    return apiClient.post('/api/education/confirm-otp', { orgId, otp });
  },
};
