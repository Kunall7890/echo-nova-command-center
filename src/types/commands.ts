
export type CommandType = 
  | 'weather' 
  | 'greeting' 
  | 'time' 
  | 'joke' 
  | 'news'
  | 'reminder'
  | 'note'
  | 'search'
  | 'systemCommand'
  | 'aiChat'
  | 'unknown';

export interface CommandResponse {
  type: CommandType;
  response: string;
  data?: any;
}

export interface Reminder {
  id: string;
  text: string;
  timestamp: Date;
  completed: boolean;
}

export interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

export interface SystemCommand {
  action: 'volume' | 'brightness' | 'wifi' | 'app';
  parameter?: string;
  value?: number;
}

export type PersonalityType = 'default' | 'formal' | 'funny' | 'tony_stark';

export interface ChatMemory {
  userName?: string;
  recentInteractions: Array<{
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
  }>;
  preferences: Record<string, any>;
  personality: PersonalityType;
}
