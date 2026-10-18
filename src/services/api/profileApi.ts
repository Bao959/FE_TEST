/**
 * Chạm Đũa - Profile, Occupations, Onboarding, & Tags API
 * Endpoints: /api/profile/*, /api/occupations, /api/onboarding/*, /api/tags/*, /api/user-tags
 */
import { apiClient } from './client';

export interface UserProfile {
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  trustScore?: number;
  profileCompletionPercent?: number;
}

export interface OccupationOption {
  occupationId: number;
  name: string;
  category?: string;
}

export interface TagItem {
  tagId: number;
  name: string;
  category?: string;
  icon?: string;
}

export interface GroupedTags {
  category: string;
  tags: TagItem[];
}

export const profileApi = {
  // Get User Profile
  getProfile: async () => {
    return apiClient.get<UserProfile>('/api/profile');
  },

  // Update Profile
  updateProfile: async (data: Partial<UserProfile>) => {
    return apiClient.put<UserProfile>('/api/profile', data);
  },

  // Get User's Occupations
  getUserOccupations: async () => {
    return apiClient.get('/api/profile/occupations');
  },

  // Set User's Occupations
  setUserOccupations: async (occupations: { occupationId: number; companyName?: string }[]) => {
    return apiClient.put('/api/profile/occupations', { occupations });
  },

  // Get System Occupation Options
  getOccupations: async () => {
    return apiClient.get<OccupationOption[]>('/api/occupations');
  },

  // Onboarding
  getOnboardingStatus: async () => {
    return apiClient.get('/api/onboarding');
  },

  getOnboardingOptions: async () => {
    return apiClient.get('/api/onboarding/options');
  },

  completeOnboarding: async (data: any) => {
    return apiClient.put('/api/onboarding/complete', data);
  },

  // Tags
  getTags: async (category?: string) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient.get<TagItem[]>(`/api/tags${q}`);
  },

  getGroupedTags: async () => {
    return apiClient.get<GroupedTags[]>('/api/tags/grouped');
  },

  getUserTags: async () => {
    return apiClient.get<TagItem[]>('/api/user-tags');
  },

  updateUserTags: async (tagIds: number[]) => {
    return apiClient.put('/api/user-tags', { tagIds });
  },
};
