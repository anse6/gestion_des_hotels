import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import LoginLayout from './composant/authentification/LoginLayout';
import Dashboard from './composant/dashboard/Dashboard';
import ProtectedRoute from './composant/authentification/ProtectedRoute';
import HotelPage from './composant/hotel/HotelPage';
import Userpep from './composant/users/userapp';
import Apppet from './composant/users/pages/Apppet';
import ServicesPage from './composant/users/pages/ServicesPage';
import ContactPage from './composant/users/pages/ContactPage';
import AboutPage from './composant/users/composant/AboutPage';
import ConfirmationPage from './composant/users/pages/ConfirmationPage';
import ReservationPage from './composant/users/pages/ReservationForm';
import EventReservationPage from './composant/users/pages/EventReservationPage';
import EventConfirmationPage from './composant/users/pages/EventConfirmationPage';
import ApartmentConfirmationPage from './composant/users/pages/ApartmentConfirmationPage';
import ApartmentReservationPage from './composant/users/pages/ApartmentReservationPage';
import ReservationsDashboard from './composant/users/pages/ReservationsDashboard';
import ScrollToTop  from './composant/ScrollToTop';
import Scanner from './composant/hotel/composant/Scanner';
import ExemplePage from './composant/hotel/composant/Qrpep';
import LoginLayoutrest from './composant/authentification/LoginLayoutrest';
import LoginLayoutrestcover from './composant/authentification/LoginLayoutrestcover';
import LoginLayoutresst from './composant/authentification/LoginLayoutresst';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Route publique - Page de connexion */}
          <Route path="/login" element={<LoginLayout />} />

           <Route path="/register" element={<LoginLayoutrestcover />} />

          <Route path="/forgotpassword" element={<LoginLayoutrest />} />//LoginLayoutresst

          <Route path="/resst-password" element={<LoginLayoutresst />} />

          
          {/* Page publique principale */}
          <Route path="/users" element={<Userpep />} />

          <Route path="/scannerqr" element={<ExemplePage />} /> 

          <Route path="/scanner" element={<Scanner />} /> /
          
          {/* Redirection par défaut vers la page publique principale */}
          <Route path="/" element={<Navigate to="/users" replace />} />
          
          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hotel" element={<HotelPage />} />
            <Route path="/hotel/:hotelId/options" element={<Apppet />} />
            <Route path="/hotels" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/my_reservation" element={<ReservationsDashboard />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/reservation/:roomId" element={<ReservationPage />} />
            <Route path="/reservation-salle/:roomId" element={<EventReservationPage />} />
            <Route path="/confirmation-evenement" element={<EventConfirmationPage />} />
            <Route path="/reservation-appartement/:apartmentId" element={<ApartmentReservationPage />} />
            <Route path="/confirmation-appartement" element={<ApartmentConfirmationPage />} />
      
            

          </Route>
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;