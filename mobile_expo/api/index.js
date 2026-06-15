import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Production Cloud API URL
const getBaseUrl = () => {
  return 'https://secureexam-k7w2.onrender.com/api';
};

export const BASE_URL = getBaseUrl();

// Helper for robust API calls with timeout
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP Error ${response.status}` };
      }
      throw new Error(errorData.message || errorData.error || 'Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your network connection.');
    }
    throw error;
  }
};

export const ApiService = {
  // --- STUDENT ENDPOINTS ---
  getExam: async (examCode) => {
    return fetchWithTimeout(`${BASE_URL}/exam/${examCode}`);
  },

  submitExam: async (examCode, studentData) => {
    return fetchWithTimeout(`${BASE_URL}/exam/${examCode}/submit`, {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  // --- FACULTY ENDPOINTS ---
  getFacultyDashboard: async (facultyId, searchQuery = '') => {
    return fetchWithTimeout(`${BASE_URL}/faculty/dashboard?faculty_id=${facultyId}&search=${encodeURIComponent(searchQuery)}`);
  },
  
  facultyLogin: async (credentials) => {
    return fetchWithTimeout(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  facultyRegister: async (data) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createExam: async (examData) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/create`, {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  },

  updateExamSettings: async (examCode, settingsData) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/${examCode}/settings`, {
      method: 'POST',
      body: JSON.stringify(settingsData),
    });
  },

  toggleExam: async (examCode) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/${examCode}/toggle`, {
      method: 'POST',
    });
  },

  getQuestions: async (examCode) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/${examCode}/questions`);
  },

  addQuestion: async (examCode, questionData) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/${examCode}/question/add`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },
  
  updateQuestion: async (examCode, questionId, questionData) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/${examCode}/question/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },

  deleteQuestion: async (examCode, questionId) => {
    return fetchWithTimeout(`${BASE_URL}/faculty/exam/${examCode}/question/${questionId}`, {
      method: 'DELETE',
    });
  },

  // --- ADMIN ENDPOINTS ---
  adminLogin: async (credentials) => {
    return fetchWithTimeout(`${BASE_URL}/admin/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getAdminFaculty: async (searchQuery = '') => {
    return fetchWithTimeout(`${BASE_URL}/faculty/list?search=${encodeURIComponent(searchQuery)}`);
  },

  getAdminExams: async (searchQuery = '') => {
    return fetchWithTimeout(`${BASE_URL}/exams/all?search=${encodeURIComponent(searchQuery)}`);
  },

  getAdminAttempts: async (searchQuery = '') => {
    return fetchWithTimeout(`${BASE_URL}/admin/attempts?search=${encodeURIComponent(searchQuery)}`);
  },

  getAdminAnalytics: async () => {
    return fetchWithTimeout(`${BASE_URL}/admin/analytics`);
  },
};
