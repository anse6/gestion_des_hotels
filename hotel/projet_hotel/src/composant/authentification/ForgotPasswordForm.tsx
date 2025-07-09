import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type ForgotPasswordCredentials = {
  email: string;
};

const ForgotPasswordForm: React.FC = () => {
  const [credentials, setCredentials] = useState<ForgotPasswordCredentials>({
    email: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    // Basic client-side email validation
    if (!credentials.email || !credentials.email.includes('@')) {
      setError({ message: 'Veuillez entrer une adresse email valide.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: credentials.email }),
      });

      // Check if the response was successful (status code 200-299)
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Un lien de réinitialisation a été envoyé à votre adresse email.');
        setCredentials({ email: '' }); // Clear the email field on success
      } else {
        // Handle API errors (e.g., 400 Bad Request, 404 Not Found, 500 Internal Server Error)
        const errorData = await response.json();
        setError({ message: errorData.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.' });
      }
    } catch (networkError: any) {
      // Handle network errors (e.g., no internet connection, server down)
      console.error("Network error during password reset request:", networkError);
      setError({ message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.' });
    } finally {
      setIsLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mot de passe oublié</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error.message}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="text-center mt-6">
        <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
        >
            ← Retour à la page de connexion
        </Link>
        </div>
         

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le mail de réinitialisation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;