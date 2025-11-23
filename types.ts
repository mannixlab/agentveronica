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

export interface Mission {
    id: string;
    description: string;
    points: number;
    status: MissionStatus;
    submissionText?: string;
    reviewComment?: string;
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
