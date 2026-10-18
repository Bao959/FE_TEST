/**
 * Chạm Đũa - Rooms API for B2B Portal (Admin & Restaurant Management)
 * (End-user mobile actions like GPS check-in, PreAuth, Join/Leave belong to React Native Mobile)
 */
import { apiClient } from './client';

export interface BackendRoom {
  roomId: number;
  title?: string;
  description?: string;
  restaurantId?: number;
  restaurantName?: string;
  restaurantAddress?: string;
  latitude?: number;
  longitude?: number;
  scheduledTime?: string;
  maxMembers?: number;
  currentMembers?: number;
  status?: string; // 'OPEN' | 'LOCKED' | 'COMPLETED' | 'CANCELLED'
  isPreAuthRequired?: boolean;
  preAuthAmount?: number;
  hostUserId?: number;
  hostName?: string;
  hostAvatar?: string;
  tags?: string[];
  createdAt?: string;
}

export const roomsApi = {
  // Get all rooms / dining sessions (for Admin oversight & Restaurant portal)
  getRooms: async () => {
    return apiClient.get<BackendRoom[]>('/api/rooms');
  },

  // Get room by ID
  getRoomById: async (roomId: number | string) => {
    return apiClient.get<BackendRoom>(`/api/rooms/${roomId}`);
  },

  // Create new room (for Partner Restaurant to open dining tables)
  createRoom: async (roomData: {
    title: string;
    description?: string;
    restaurantName?: string;
    restaurantAddress?: string;
    latitude?: number;
    longitude?: number;
    scheduledTime?: string;
    maxMembers?: number;
    isPreAuthRequired?: boolean;
    preAuthAmount?: number;
  }) => {
    return apiClient.post<BackendRoom>('/api/rooms', roomData);
  },

  // Update room status or settings (Admin / Restaurant)
  updateRoom: async (roomId: number | string, roomData: Partial<BackendRoom>) => {
    return apiClient.put<BackendRoom>(`/api/rooms/${roomId}`, roomData);
  },

  // Delete / Cancel room (Admin emergency cancellation)
  deleteRoom: async (roomId: number | string) => {
    return apiClient.delete(`/api/rooms/${roomId}`);
  },
};
