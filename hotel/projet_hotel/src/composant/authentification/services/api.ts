import axios from 'axios';
import type { LoginResponse, LoginCredentials, Hotel, AuthError } from '../types/auth'; // Ensure AuthError is imported

const API_BASE_URL = 'http://localhost:5000/api';

// This initial token injection is good for the *very first* load.
// For subsequent loads and persistent auth, ProtectedRoute needs to handle it.
const savedToken = localStorage.getItem('token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      // Cast error to 'any' or 'AxiosError' for detailed access
      const axiosError = error as any; // Using 'any' for simpler access if AxiosError is not imported/typed
      let errorMessage = 'Une erreur inattendue est survenue.';
      let errorStatus: number | undefined;

      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorStatus = axiosError.response.status;
        if (axiosError.response.data && axiosError.response.data.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response.status === 401) {
          errorMessage = 'mot de passe incorrect.';
        } else if (axiosError.response.status === 402) {
          errorMessage = 'cet utilisateur est introuvable.';
        } else if (axiosError.response.status === 403) {
          errorMessage = 'Compte désactivé. veillez contactez l\'equipe technique';
        } else {
          errorMessage = `Erreur du serveur: ${axiosError.response.status}`;
        }
      } else if (axiosError.request) {
        // The request was made but no response was received
        errorMessage = 'Pas de réponse du serveur. Veuillez vérifier votre connexion.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = axiosError.message;
      }
      
      // Re-throw the error as AuthError to be caught by useMutation's onError
      throw { message: errorMessage, status: errorStatus } as AuthError;
    }
  },

  getMyHotels: async (): Promise<Hotel[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel/my-hotels`);
      return response.data;
    } catch (error) {
      console.error("Error fetching hotels:", error);
      // Re-throw or handle as per your application's error strategy
      throw error;
    }
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};