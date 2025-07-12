// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setAuthToken } from './services/api';
type User = {
  email: string; // Add email to User type as it's stored
  name: string; // Add name to User type as it's stored
  role: string;
  token: string; // Add token to User type
};

const ProtectedRoute: React.FC<{ adminOnly?: boolean }> = ({ adminOnly = false }) => {
  const queryClient = useQueryClient();

  // Attempt to load user data from localStorage
  const storedToken = localStorage.getItem('token');
  const storedUserEmail = localStorage.getItem('userEmail');
  const storedUserName = localStorage.getItem('userName');
  const storedUserRole = localStorage.getItem('userRole');
  const storedHotelId = localStorage.getItem('hotelId');
  const storedHotelName = localStorage.getItem('hotelName');

  // Initialize query cache if data exists in localStorage and not already in cache
  const userQueryData = queryClient.getQueryData<User>(['user']);
  const hotelQueryData = queryClient.getQueryData<any>(['hotel']); // Type as per your Hotel interface

  // Only re-hydrate if the query cache is empty but localStorage has data
  if (!userQueryData && storedToken && storedUserEmail && storedUserName && storedUserRole) {
    const initialUserData: User = {
      email: storedUserEmail,
      name: storedUserName,
      role: storedUserRole,
      token: storedToken,
    };
    queryClient.setQueryData(['user'], initialUserData);
    setAuthToken(storedToken); // Re-set the Axios authorization header

    // Also re-hydrate hotel data if available for admin
    if (storedUserRole === 'admin' && storedHotelId && storedHotelName && !hotelQueryData) {
      queryClient.setQueryData(['hotel'], { id: storedHotelId, name: storedHotelName });
    }
  }

  // Now use useQuery to get the user data (it will get from cache if re-hydrated)
  const { data: user } = useQuery<User>({ queryKey: ['user'] });
  const { data: hotel } = useQuery<any>({ queryKey: ['hotel'] }); // Ensure this type matches your Hotel interface

  // If no user data (even after re-hydration attempt), redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-specific check: if adminOnly is true and user is admin but no hotel is set, redirect
  // This might be too strict. If an admin logs in and has no hotel, maybe they should see a page to create one,
  // rather than being redirected to login. Consider your UX here.
  if (adminOnly && user.role === 'admin' && !hotel) {
     // If an admin doesn't have a hotel, maybe they should go to a page to select/create one,
     // not necessarily back to login. For now, keep as original logic, but note this consideration.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;