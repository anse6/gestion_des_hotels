import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export const fetchRooms = async (hotelId: number) => {
  const response = await axiosInstance.get(`/hotel/${hotelId}/rooms`);
  console.log('Données fetchRooms:', response.data);
  return response.data;
};

export const fetchEventRooms = async (hotelId: number) => {
  const response = await axiosInstance.get(`/hotel/${hotelId}/event-rooms`);
  console.log('Données fetchEventRooms:', response.data);
  return response.data;
};

export const fetchApartments = async (hotelId: number) => {
  const response = await axiosInstance.get(`/hotel/${hotelId}/apartments`);
  console.log('Données fetchApartments:', response.data);
  return response.data;
};
