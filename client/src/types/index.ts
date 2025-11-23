export interface Note {
  id: string;
  code: string;
  title: string;
  createdAt: Date;
  activeUsers?: number;
}

export interface Version {
  id: string;
  timestamp: Date;
  author: string;
  content?: any;
}

export interface User {
  id: string;
  name: string;
  color?: string;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: any;
  selection: any;
}
