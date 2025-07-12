// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

type User = {
  role: string;
 
};

const ProtectedRoute: React.FC<{ adminOnly?: boolean }> = ({ adminOnly = false }) => {
  const { data: user } = useQuery<User>({ queryKey: ['user'] });
  const { data: hotel } = useQuery({ queryKey: ['hotel'] });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role === 'admin' && !hotel) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;