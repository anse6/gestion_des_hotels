import axios from 'axios';
import type { LoginResponse, LoginCredentials, Hotel } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Si un token est déjà stocké au chargement, on l’injecte
const savedToken = localStorage.getItem('token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  getMyHotels: async (): Promise<Hotel[]> => {
    const response = await axios.get(`${API_BASE_URL}/hotel/my-hotels`);
    return response.data;
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
