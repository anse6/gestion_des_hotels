import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importez useNavigate

type RegisterCredentials = {
  name: string;
  email: string;
  password: string; // Pour la confirmation du mot de passe côté client
};

// Pas besoin de props spécifiques pour le moment, mais peut être ajouté si nécessaire
type RegisterFormProps = {
  onRegistrationSuccess?: () => void; // Callback optionnel après inscription réussie
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegistrationSuccess }) => {
  const navigate = useNavigate(); // Hook pour la navigation après l'inscription

  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    // --- Validations côté client ---
    if (!credentials.name || !credentials.email || !credentials.password ) {
      setError({ message: 'Tous les champs sont obligatoires.' });
      setIsLoading(false);
      return;
    }

   

    if (credentials.password.length < 6) { // Exemple: longueur minimale du mot de passe
      setError({ message: 'Le mot de passe doit contenir au minimum 6 caractères.' });
      setIsLoading(false);
      return;
    }

    if (!credentials.email.includes('@') || !credentials.email.includes('.')) {
      setError({ message: 'Veuillez entrer une adresse email valide.' });
      setIsLoading(false);
      return;
    }
    // --- Fin des validations côté client ---

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password // Note: On envoie le 'password', pas 'confirm_password' au backend
        }),
      });

      // Check if the response was successful (status code 200-299)
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Votre compte a été créé avec succès !');
        setCredentials({ name: '', email: '', password: '' }); // Clear the form

        onRegistrationSuccess?.(); // Notify parent of success

        // Optionnel: Rediriger l'utilisateur vers la page de connexion après quelques secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirige après 3 secondes
        
      } else {
        // Handle API errors (e.g., 400 Bad Request, 409 Conflict, 500 Internal Server Error)
        const errorData = await response.json();
        // Le backend renvoie 'error' si l'email existe déjà, ou 'message' pour d'autres erreurs
        setError({ message: errorData.error || errorData.message || 'Une erreur est survenue lors de la création du compte.' });
      }
    } catch (networkError: any) {
      // Handle network errors (e.g., no internet connection, server down)
      console.error("Network error during registration:", networkError);
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Créer un compte</h2>
      
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom complet
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={credentials.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </div>

        <div className="text-center text-sm mt-4">
          Vous avez déjà un compte ?{' '}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
          >
            Connectez-vous
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;