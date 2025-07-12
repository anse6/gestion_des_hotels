import React, { useState, useEffect } from "react";
import axios from "axios";

interface HotelData {
  id: number;
  admin_id: number;
  name: string;
  email: string;
  phone: string;
  description: string;
  city: string;
  country: string;
  stars: number;
  website: string;
  created_at: string;
}

const Parametres: React.FC = () => {
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // Récupère le token du localStorage

        if (!token) {
          setError("Aucun token trouvé. Veuillez vous connecter.");
          setLoading(false);
          return;
        }

        const response = await axios.get<HotelData[]>(
          "http://localhost:5000/api/hotel/my-hotels",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ajoute le token dans l'en-tête Authorization
            },
          }
        );

        // L'API retourne un tableau, nous prenons le premier élément s'il existe
        if (response.data && response.data.length > 0) {
          setHotel(response.data[0]);
        } else {
          setError("Aucune donnée d'hôtel trouvée.");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              "Erreur lors de la récupération des données de l'hôtel."
          );
        } else {
          setError("Une erreur inattendue est survenue.");
        }
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Chargement des données de l'hôtel...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">Erreur : {error}</div>
    );
  }

  // Si hotel est null ici, c'est qu'il n'y a pas de données après le chargement
  if (!hotel) {
    return (
      <div className="p-6 text-center text-gray-600">Aucune information d'hôtel disponible.</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
        <p className="text-gray-600">Gérez les paramètres de votre système hôtelier</p>
      </div>

      <div className="w-full h-screen p-6 pb-15">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Informations sur l'hôtel</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'hôtel
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={hotel.name || ""}
                  readOnly // Rend le champ en lecture seule car ce composant n'implémente pas la modification
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom légal de l'entreprise
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={hotel.name || ""} // L'API ne fournit pas de "nom légal d'entreprise", j'utilise le nom de l'hôtel pour l'exemple
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={hotel.email || ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={hotel.phone || ""}
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  // eslint-disable-next-line no-constant-binary-expression
                  defaultValue={`${hotel.city}, ${hotel.country}` || ""} // Concatène ville et pays pour l'adresse
                  readOnly
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ville"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={hotel.city || ""}
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="État/Province"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="" // L'API ne fournit pas l'état/province
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="" // L'API ne fournit pas le code postal
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Pays"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={hotel.country || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description de l'hôtel
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={hotel.description || ""}
                  readOnly
                ></textarea>
              </div>
            </div>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer !rounded-button">
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;