import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, setAuthToken } from '../services/api';
import type { LoginResponse, LoginCredentials, AuthError } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation<LoginResponse, AuthError, LoginCredentials>({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Configure axios pour toutes les requêtes suivantes
      setAuthToken(data.token);

      // Stocker dans localStorage pour persistance
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);

      // Mettre en cache dans react-query
      queryClient.setQueryData(['user'], {
        email: data.email,
        name: data.name,
        role: data.role,
        token: data.token
      });

      // Si admin, récupérer l'hôtel associé
      if (data.role === 'admin') {
        try {
          const hotels = await authApi.getMyHotels();
          if (hotels.length > 0) {
            const hotel = hotels[0];
            localStorage.setItem('hotelId', hotel.id);
            localStorage.setItem('hotelName', hotel.name);
            queryClient.setQueryData(['hotel'], hotel);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'hôtel:", error);
        }
      }

      // Redirection en fonction du rôle
      switch (data.role) {
        case 'superadmin':
          navigate('/dashboard');
          break;
        case 'admin':
          navigate('/hotel');
          break;
        case 'user':
          navigate('/users');
          break;
        default:
          navigate('/');
      }

      toast.success(`Bienvenue ${data.name}!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Échec de la connexion');
    }
  });

  const logout = () => {
    const userRole = localStorage.getItem('userRole');
    
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hotelId');
    localStorage.removeItem('hotelName');
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.removeQueries({ queryKey: ['hotel'] });
    queryClient.clear();
    
    // Redirection différente selon le rôle
    if (userRole === 'user') {
      navigate('/users');
    } else {
      navigate('/');
    }
    
    toast.success('Déconnexion réussie');
  };

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    logout
  };
};