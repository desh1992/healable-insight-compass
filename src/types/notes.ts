export type NoteType = 'manual' | 'ai_generated' | 'live_capture';

export interface Note {
  id: string;
  patientId: string;
  content: string;
  timestamp: string;
  type: NoteType;
}

export interface LiveNote extends Note {
  speaker: 'doctor' | 'patient' | 'system';
  isActive?: boolean;
} 