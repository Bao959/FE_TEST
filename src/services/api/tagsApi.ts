/**
 * Chạm Đũa - System Tags & Categories API for Admin & Restaurant Management
 * (User profile mutations & diner onboarding survey are reserved for React Native Mobile)
 */
import { apiClient } from './client';

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

export const tagsApi = {
  // Get active system tags (for restaurant dish tagging & admin category monitoring)
  getTags: async (category?: string) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient.get<TagItem[]>(`/api/tags${q}`);
  },

  // Get tags grouped by category
  getGroupedTags: async () => {
    return apiClient.get<GroupedTags[]>('/api/tags/grouped');
  },

  // Get system occupation categories
  getOccupations: async () => {
    return apiClient.get<OccupationOption[]>('/api/occupations');
  },
};
