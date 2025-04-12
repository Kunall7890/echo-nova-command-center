
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
