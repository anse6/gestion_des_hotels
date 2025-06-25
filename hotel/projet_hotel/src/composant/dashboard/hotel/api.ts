import axios from 'axios';
import type { Hotel } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration initiale d'axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const hotelApi = {
  getHotels: () => axiosInstance.get<Hotel[]>(`/hotel/`),
  createHotel: (hotel: Omit<Hotel, 'id' | 'created_at' | 'admin_id'>) => 
    axiosInstance.post<Hotel>(`/hotel`, hotel),
  updateHotel: (hotel: Hotel) => 
    axiosInstance.put<Hotel>(`/hotel/${hotel.id}`, hotel),
  deleteHotel: (id: number) => 
    axiosInstance.delete(`/hotel/${id}`),
};