import axios from 'axios'
import type { ApiResponse, User, Lesson, Exercise } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', {
      name,
      email,
      password,
    })
    return response.data
  },

  logout: async () => {
    localStorage.removeItem('token')
  },
}

// User API
export const userApi = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/user/profile')
    return response.data
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>('/user/profile', data)
    return response.data
  },
}

// Lessons API
export const lessonsApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Lesson[]>>('/lessons')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`)
    return response.data
  },

  getProgress: async () => {
    const response = await api.get<ApiResponse<{ lessonId: string; progress: number }[]>>('/lessons/progress')
    return response.data
  },

  updateProgress: async (lessonId: string, progress: number) => {
    const response = await api.post<ApiResponse<void>>(`/lessons/${lessonId}/progress`, { progress })
    return response.data
  },
}

// Exercises API
export const exercisesApi = {
  getByLessonId: async (lessonId: string) => {
    const response = await api.get<ApiResponse<Exercise[]>>(`/lessons/${lessonId}/exercises`)
    return response.data
  },

  execute: async (code: string, language: string = 'python') => {
    const response = await api.post<ApiResponse<{ output: string; error?: string }>>('/execute', {
      code,
      language,
    })
    return response.data
  },

  submit: async (exerciseId: string, code: string) => {
    const response = await api.post<ApiResponse<{ correct: boolean; feedback: string }>>(
      `/exercises/${exerciseId}/submit`,
      { code }
    )
    return response.data
  },
}

export default api
