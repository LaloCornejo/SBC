export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  joinDate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  completed: boolean;
  progress: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  hints: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}
