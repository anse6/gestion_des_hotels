// src/components/ResetPasswordForm.tsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type ResetPasswordCredentials = {
  new_password: string;
  confirm_password: string;
};

type ResetPasswordFormProps = {
  onPasswordResetSuccess?: () => void; // Callback after successful password reset
  onGoBack?: () => void; // Optional: A way to go back to previous step if needed
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onPasswordResetSuccess,
  onGoBack
}) => {
  const [credentials, setCredentials] = useState<ResetPasswordCredentials>({
    new_password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Récupération automatique du token depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // Si pas de token dans l'URL, rediriger vers la page d'accueil ou afficher une erreur
      setError({ message: 'Token manquant. Veuillez utiliser le lien reçu par email.' });
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError({ message: 'Token manquant. Veuillez utiliser le lien reçu par email.' });
      setIsLoading(false);
      return;
    }

    if (credentials.new_password !== credentials.confirm_password) {
      setError({ message: 'Les mots de passe ne correspondent pas.' });
      setIsLoading(false);
      return;
    }

    if (credentials.new_password.length < 6) {
      setError({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: credentials.new_password,
          confirm_password: credentials.confirm_password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Mot de passe réinitialisé avec succès !');
        setCredentials({ new_password: '', confirm_password: '' });
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          navigate('/login');
          onPasswordResetSuccess?.();
        }, 2000);
        
      } else {
        const errorData = await response.json();
        setError({ message: errorData.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.' });
      }
    } catch (networkError: any) {
      console.error("Network error during password reset:", networkError);
      setError({ message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Afficher un message de chargement pendant la récupération du token
  if (!token && !error) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification du token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nouveau mot de passe</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error.message}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
            <p className="text-sm mt-2">Redirection vers la page de connexion...</p>
          </div>
        )}

        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={credentials.new_password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={credentials.confirm_password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !token}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading || !token ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
          </button>
        </div>

        {onGoBack && (
          <div className="text-center text-sm mt-4">
            <button
              type="button"
              onClick={onGoBack}
              className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
            >
              Annuler
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordForm;