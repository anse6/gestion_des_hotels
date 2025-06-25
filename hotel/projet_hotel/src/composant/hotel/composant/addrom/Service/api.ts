import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApartments = async (hotelId: number, searchParams = {}) => {
  const response = await api.get(`/hotel/${hotelId}/apartments`, {
    params: searchParams,
  });
  return response.data;
};

interface ApartmentData {
  name: string;
  description?: string;
  price: number;
  // Add other fields as needed
}

export const createApartment = async (hotelId: number, apartmentData: ApartmentData) => {
  const response = await api.post(`/hotel/${hotelId}/apartments`, apartmentData);
  return response.data;
};

export const updateApartment = async (apartmentId: number, apartmentData: ApartmentData) => {
  const response = await api.put(`/hotel/apartments/${apartmentId}`, apartmentData);
  return response.data;
};

export const deleteApartment = async (apartmentId: number) => {
  const response = await api.delete(`/hotel/apartments/${apartmentId}`);
  return response.data;
};