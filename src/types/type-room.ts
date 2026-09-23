import type { LucideIcon } from 'lucide-react';
import type {
  RoomCreateSchema,
  RoomJoinSchema,
  RoomLeaveSchema,
  RoomParticipantSchema,
  RoomSchema,
  RoomUpdateSchema
} from 'src/schemas/schema-chat';
import type { z } from 'zod';

import type { UserType } from './type-user';

export type RoomType = z.infer<typeof RoomSchema>;
export type RoomParticipantType = z.infer<typeof RoomParticipantSchema>;
export type CreateRoomInput = z.infer<typeof RoomCreateSchema>;
export type UpdateRoomInput = z.infer<typeof RoomUpdateSchema>;
export type RoomJoinInput = z.infer<typeof RoomJoinSchema>;
export type RoomLeaveInput = z.infer<typeof RoomLeaveSchema>;

export interface ChatUserStatus {
  name: string;
  label: string;
  icon: LucideIcon;
  color:
  | 'success.main'
  | 'error.light'
  | 'yellow.main'
  | 'orange.main'
  | 'stone.main'
  | 'stone.dark';
  bgColor: 'success' | 'error' | 'yellow' | 'orange' | 'stone' | 'stone';
  bgColorChannel:
  | 'mainChannel'
  | 'lightChannel'
  | 'lighterChannel'
  | 'darkChannel'
  | 'darkerChannel';
}

export type JoinRoomUserInput = {
  roomId: string;
  socketId: string;
  userId: string;
  name: string;
  profilePhoto: string;
  isMuted: boolean;
  status: string;
  userType: 'host' | 'guest';
  verified: UserType['verified'];
  accountType: UserType['accountType'];
};

export type LeaveRoomUserInput = {
  roomId: string;
  userId: string;
  kicked?: boolean;
};

// src/sections/section-voice/voice-room-stage/types.ts

import type { LocalParticipant, Participant, RemoteParticipant } from 'livekit-client';

/**
 * Standardized parsed metadata transmitted over LiveKit room tokens or participant metadata
 */
export interface ParticipantMetadataType {
  name?: string;
  username?: string;
  verified?: boolean;
  profilePhoto?: string;
  genUserId?: string;
  accountType?: 'user' | 'creator' | 'admin' | 'guest' | string;
  isHost?: boolean;
  status?: 'online' | 'busy' | 'brb' | 'afk' | 'zzz' | 'offline' | string;
  [key: string]: unknown;
}

/**
 * High-level room role representation
 */
export type ParticipantRoomRole = 'host' | 'co-host' | 'speaker' | 'listener';

/**
 * Reactive audio states (used by indicators and speaking animations)
 */
export type ParticipantAudioState = 'speaking' | 'unmuted' | 'muted' | 'listening';

/**
 * Primary enriched participant type consumed by Stage, Audio Tiles, Contexts, and Drawers
 */
export interface ParticipantStageType {
  // Identifiers
  id: string;                                // LiveKit identity string
  userId: string;                            // Unique app database user ID
  genUserId?: string;                        // Public/display user identifier code

  // Profile & Details
  name: string;                              // Display name
  username: string;                          // Handle (e.g. @alex)
  profilePhoto: string;                      // Avatar URL
  verified: boolean;                         // Verification badge check
  accountType?: string;                      // e.g. 'creator', 'premium', 'standard'
  status?: string;                           // Chat user status ('online', 'afk', etc.)

  // Room State & Permissions
  role: ParticipantRoomRole;                 // 'host' | 'co-host' | 'speaker' | 'listener'
  isHost: boolean;                           // True if host of current active room
  isSelf: boolean;                           // True if this participant is the local viewer
  handRaised: boolean;                       // Hand raise flag from real-time interaction
  activeReactionEmoji: string | null;        // Active floating reaction emoji (or null)

  // Optional LiveKit Connection & Audio Flags (resolved locally or in tiles)
  audioState?: ParticipantAudioState;        // 'speaking' | 'unmuted' | 'muted' | 'listening'
  isSpeaking?: boolean;                      // Real-time audio activity flag
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'failed' | null;
  hasJoin?: boolean;                         // Connection lifecycle flag

  // Social Relations (O(1) Set lookups relative to current logged-in user)
  isFollowing: boolean;                      // True if current user follows this participant                     // True if mutual friend
  isBlocked: boolean;                        // True if blocked by current user

  // Raw LiveKit Object Reference
  rawParticipant: Participant | RemoteParticipant | LocalParticipant;
}

/**
 * Chat Message Types (used by Stage Chat and Data Channel)
 */
export interface ChatReaction {
  emoji: string;
  count: number;
  reactedBySelf?: boolean;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  editedAt?: string;
  replyToId?: string;
  isSelf?: boolean;
  privateTo?: { id: string; name: string };
  reactions?: ChatReaction[];
}
