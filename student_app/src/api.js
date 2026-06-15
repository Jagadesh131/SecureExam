// src/api.js
// Configure your API Base URL here
// For Android emulator testing local backend, use 10.0.2.2.
// For iOS simulator, use localhost.
const API_BASE_URL = 'http://127.0.0.1:5000/api'; 

export const fetchExamDetails = async (examCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exam/${examCode}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Exam not found or inactive');
      throw new Error('Failed to fetch exam');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const submitExam = async (examCode, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exam/${examCode}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit exam');
    }
    return data;
  } catch (error) {
    throw error;
  }
};
