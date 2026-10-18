/**
 * Chạm Đũa - Rooms & Dining Sessions API
 * Endpoints: /api/rooms/*
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

export interface RoomMember {
  roomMemberId: number;
  roomId: number;
  userId: number;
  name?: string;
  avatarUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'LEFT';
  joinedAt?: string;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  address?: string;
}

export const roomsApi = {
  // Get all rooms / dining sessions
  getRooms: async () => {
    return apiClient.get<BackendRoom[]>('/api/rooms');
  },

  // Get room by ID
  getRoomById: async (roomId: number | string) => {
    return apiClient.get<BackendRoom>(`/api/rooms/${roomId}`);
  },

  // Create new room / dining session
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

  // Update room
  updateRoom: async (roomId: number | string, roomData: Partial<BackendRoom>) => {
    return apiClient.put<BackendRoom>(`/api/rooms/${roomId}`, roomData);
  },

  // Delete / Cancel room
  deleteRoom: async (roomId: number | string) => {
    return apiClient.delete(`/api/rooms/${roomId}`);
  },

  // Join room request
  joinRoom: async (roomId: number | string) => {
    return apiClient.post<RoomMember>(`/api/rooms/${roomId}/join`);
  },

  // Leave room
  leaveRoom: async (roomId: number | string) => {
    return apiClient.post<RoomMember>(`/api/rooms/${roomId}/leave`);
  },

  // Get pending member requests (for host)
  getPendingMembers: async (roomId: number | string) => {
    return apiClient.get<RoomMember[]>(`/api/rooms/${roomId}/members/pending`);
  },

  // Approve member
  approveMember: async (roomId: number | string, memberId: number | string) => {
    return apiClient.post<RoomMember>(`/api/rooms/${roomId}/members/${memberId}/approve`);
  },

  // Reject member
  rejectMember: async (roomId: number | string, memberId: number | string) => {
    return apiClient.post<RoomMember>(`/api/rooms/${roomId}/members/${memberId}/reject`);
  },

  // GPS Check-in at restaurant
  checkIn: async (roomId: number | string, request: CheckInRequest) => {
    return apiClient.post(`/api/rooms/${roomId}/check-in`, request);
  },

  // Create pre-authorization deposit
  createPreAuthorization: async (roomId: number | string, amount: number) => {
    return apiClient.post(`/api/rooms/${roomId}/preauthorizations`, { amount });
  },

  // Get pre-authorization status
  getPreAuthorization: async (roomId: number | string, preAuthId: number | string) => {
    return apiClient.get(`/api/rooms/${roomId}/preauthorizations/${preAuthId}`);
  },
};
