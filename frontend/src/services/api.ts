import axios from "axios";
import type { ApiResponse, User, Lesson, Exercise, Tema, UserLearningContent, StudentSummary, DiagnosticResultWithId, ExpertAnnotation } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8003";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>(
      "/auth/login",
      {
        email,
        password,
      },
    );
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>(
      "/auth/register",
      {
        name,
        email,
        password,
      },
    );
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem("token");
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>("/user/profile");
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>("/user/profile", data);
    return response.data;
  },
};

// Lessons API
export const lessonsApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Lesson[]>>("/lessons");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data;
  },

  getProgress: async () => {
    const response =
      await api.get<ApiResponse<{ lessonId: string; progress: number }[]>>(
        "/lessons/progress",
      );
    return response.data;
  },

  updateProgress: async (lessonId: string, progress: number) => {
    const response = await api.post<ApiResponse<void>>(
      `/lessons/${lessonId}/progress`,
      { progress },
    );
    return response.data;
  },
};

// Exercises API
export const exercisesApi = {
  getByLessonId: async (lessonId: string) => {
    const response = await api.get<ApiResponse<Exercise[]>>(
      `/lessons/${lessonId}/exercises`,
    );
    return response.data;
  },

  execute: async (code: string, language: string = "python") => {
    const response = await api.post<
      ApiResponse<{ output: string; error?: string }>
    >("/v1/execute", {
      code,
      language,
    });
    return response.data;
  },

  submit: async (exerciseId: string, code: string) => {
    const response = await api.post<
      ApiResponse<{ correct: boolean; feedback: string }>
    >(`/exercises/${exerciseId}/submit`, { code });
    return response.data;
  },
};

// Diagnostic API
export type DiagnosticResult = {
  result: 'python' | 'cpp' | 'java';
  python_score: number;
  cpp_score: number;
  java_score: number;
  difficulty_responses?: string[];
};

export const diagnosticApi = {
  saveResult: async (
    username: string,
    result: DiagnosticResult
  ) => {
    const response = await api.post<ApiResponse<{ username: string }>>(
      "/v1/diagnostic-result",
      {
        username,
        result: result.result,
        python_score: result.python_score,
        cpp_score: result.cpp_score,
        java_score: result.java_score,
        difficulty_responses: result.difficulty_responses || [],
      }
    );
    return response.data;
  },

  getResults: async (username: string) => {
    const response = await api.get<ApiResponse<DiagnosticResult[]>>(
      `/v1/diagnostic-results/${username}`
    );
    return response.data;
  },
};

// Content API (Aprender module)
export const contentApi = {
  getByLanguage: async (language: string) => {
    const response = await api.get<ApiResponse<Tema[]>>(
      `/v1/content/${language}`
    );
    return response.data;
  },

  getByLanguageAndLevel: async (language: string, level: string) => {
    const response = await api.get<ApiResponse<Tema[]>>(
      `/v1/content/${language}/${level}`
    );
    return response.data;
  },

  getUserContent: async (username: string) => {
    const response = await api.get<ApiResponse<UserLearningContent>>(
      `/v1/content/user/${username}`
    );
    return response.data;
  },
};

// Expert API
export const expertApi = {
  getStudents: async (expertUsername: string) => {
    const response = await api.get<ApiResponse<StudentSummary[]>>(
      `/v1/expert/students`,
      { params: { expert_username: expertUsername } }
    );
    return response.data;
  },

  getStudentDiagnostics: async (studentUsername: string, expertUsername: string) => {
    const response = await api.get<ApiResponse<DiagnosticResultWithId[]>>(
      `/v1/expert/student/${studentUsername}/diagnostics`,
      { params: { expert_username: expertUsername } }
    );
    return response.data;
  },

  createAnnotation: async (
    expertUsername: string,
    studentUsername: string,
    annotation: string,
    diagnosticId?: number
  ) => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/v1/expert/annotation",
      {
        expert_username: expertUsername,
        student_username: studentUsername,
        annotation,
        diagnostic_id: diagnosticId,
      }
    );
    return response.data;
  },

  updateAnnotation: async (
    annotationId: number,
    annotation: string,
    expertUsername: string
  ) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/v1/expert/annotation/${annotationId}`,
      { annotation },
      { params: { expert_username: expertUsername } }
    );
    return response.data;
  },

  getStudentAnnotations: async (studentUsername: string, expertUsername: string) => {
    const response = await api.get<ApiResponse<ExpertAnnotation[]>>(
      `/v1/expert/annotations/${studentUsername}`,
      { params: { expert_username: expertUsername } }
    );
    return response.data;
  },

  deleteAnnotation: async (annotationId: number, expertUsername: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/v1/expert/annotation/${annotationId}`,
      { params: { expert_username: expertUsername } }
    );
    return response.data;
  },
};

export default api;
