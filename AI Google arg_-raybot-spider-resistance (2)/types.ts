
export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
}

export interface TranscriptEntry {
  sender: Sender;
  text: string;
  timestamp: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export enum MissionStatus {
    ASSIGNED = 'ASSIGNED',
    PENDING_REVIEW = 'PENDING_REVIEW',
    COMPLETED = 'COMPLETED',
}

// Main categories for the clue matrix
export enum MissionCategory {
    KNOW = 'KNOW',
    ACTION = 'ACTION',
    SHARE = 'SHARE',
    ALTERNATIVE = 'ALTERNATIVE',
}

// Subcategories for the clue matrix
export enum MissionSubcategory {
    LOVE_HUMAN_RELATIONSHIPS = 'Love/Human Relationships',
    RACISM = 'Racism',
    SEXISM = 'Sexism',
    HOMO_TRANSphobia = 'Homo/Transphobia',
    THE_THREAT_OF_AI = 'The Threat of AI',
}

// Represents a single, unique mission/clue discovered by an agent
export interface ClueMission {
    description: string;
    points: number;
}

// The deeply nested structure holding all 100+ clues for a single song
export type SongClueMatrix = {
    [key in MissionCategory]?: {
        [key in MissionSubcategory]?: ClueMission[]; // Array of clues, index corresponds to time segment
    }
}

export interface Mission {
    id: string;
    description: string;
    points: number;
    status: MissionStatus;
    submissionText?: string;
    reviewComment?: string;
    category?: MissionCategory;
    subcategory?: MissionSubcategory;
}

export interface AgentProfile {
  id:string;
  name: string;
  peacePoints: number;
  password: string;
  missions: Mission[];
  phone?: string;
  email?: string;
}


// The new, definitive type for a song in the Resistance database.
// Audio data is no longer stored in the app.
export interface RecognizedSong {
    id: string; // This is now the ACRCloud ID (acrid).
    title: string;
    artist: string;
    album?: string;
    duration: number; // Duration in seconds, provided by admin.
    clueMatrix: SongClueMatrix; // The new, deep matrix of generated clues.
    isAvailableToAgents: boolean;
}