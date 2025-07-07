import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, MapPin, Calendar, DollarSign, Clock, QrCode, Plus, X } from 'lucide-react';

interface Personnel {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  salary: number;
  shift_type: string;
  is_active: boolean;
  created_at: string;
  hotel_id: number;
  phone_device_id: string;
  qr_code_id: string;
}

interface PersonnelFormData {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  phone: string;
  salary: number;
  neighborhood: string;
  shift_type: string;
}

const Personnel: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PersonnelFormData>({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    phone: '',
    salary: 0,
    neighborhood: '',
    shift_type: 'day'
  });

  // Fonction pour récupérer les données depuis l'API
  const fetchPersonnel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await fetch('http://localhost:5000/api/personnel/personnes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data: Personnel[] = await response.json();
      setPersonnel(data);
      setFilteredPersonnel(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  // Fonction pour créer un nouveau personnel
  const createPersonnel = async (data: PersonnelFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await fetch('http://localhost:5000/api/personnel/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du personnel');
      }

      const newPersonnel = await response.json();
      setPersonnel(prev => [...prev, newPersonnel]);
      setFilteredPersonnel(prev => [...prev, newPersonnel]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Fonction de recherche
  useEffect(() => {
    const filtered = personnel.filter(person =>
      person.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.phone?.includes(searchTerm) ||
      person.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPersonnel(filtered);
  }, [searchTerm, personnel]);

  // Gestion du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await createPersonnel(formData);

    if (success) {
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        address: '',
        phone: '',
        salary: 0,
        neighborhood: '',
        shift_type: 'day'
      });
    }

    setIsSubmitting(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      address: '',
      phone: '',
      salary: 0,
      neighborhood: '',
      shift_type: 'day'
    });
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatage du salaire
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatage du type de shift
  const formatShiftType = (shift: string) => {
    return shift === 'day' ? 'Jour' : 'Nuit';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">Erreur: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4"> {/* Added flex-wrap and gap-4 */}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <User className="mr-3" size={28} />
                Gestion du Personnel
              </h1>
              <p className="text-blue-100 mt-1">
                {filteredPersonnel.length} personne{filteredPersonnel.length > 1 ? 's' : ''} trouvée{filteredPersonnel.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Ajouter Personnel
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone ou quartier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Tableau / Liste adaptatif */}
        <div className="hidden md:block overflow-x-auto"> {/* Hide table on small screens, show on md and up */}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personne
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Informations
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {person.first_name?.[0] ?? ''}{person.last_name?.[0] ?? ''}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {person.first_name} {person.last_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {person.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="mr-2 text-gray-400" size={16} />
                        {person.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="mr-2 text-gray-400" size={16} />
                        {person.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="mr-2 text-gray-400" size={16} />
                        {person.neighborhood}
                      </div>
                      <div className="text-sm text-gray-500">
                        {person.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="mr-2 text-gray-400" size={16} />
                        {formatSalary(person.salary)}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="mr-2 text-gray-400" size={16} />
                        {formatShiftType(person.shift_type)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 text-gray-400" size={16} />
                        {formatDate(person.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      person.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {person.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <QrCode className="mr-2 text-gray-400" size={16} />
                      <span className="text-xs text-gray-500 font-mono">
                        {person.qr_code_id?.split('-').slice(-1)[0] ?? ''}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card View for Mobile (Below md breakpoint) */}
        <div className="block md:hidden p-4 space-y-4"> {/* Show cards on small screens, hide on md and up */}
          {filteredPersonnel.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-10 w-10 mr-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {person.first_name?.[0] ?? ''}{person.last_name?.[0] ?? ''}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{person.first_name} {person.last_name}</h3>
                  <p className="text-sm text-gray-500">ID: {person.id}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex items-center">
                  <Mail className="mr-2 text-gray-400" size={16} />
                  <span>{person.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 text-gray-400" size={16} />
                  <span>{person.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 text-gray-400" size={16} />
                  <span>{person.neighborhood}, {person.address}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-gray-400" size={16} />
                  <span>{formatSalary(person.salary)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 text-gray-400" size={16} />
                  <span>{formatShiftType(person.shift_type)}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="mr-2 text-gray-400" size={16} />
                  <span>{formatDate(person.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <QrCode className="mr-2 text-gray-400" size={16} />
                  <span className="text-xs text-gray-500 font-mono">
                    QR: {person.qr_code_id?.split('-').slice(-1)[0] ?? ''}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  person.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {person.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredPersonnel.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun personnel trouvé</h3>
            <p className="mt-2 text-gray-500">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Modal pour ajouter un personnel */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"> {/* Added p-4 for modal padding on small screens */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"> {/* Changed mx-4 to mx-auto for better centering */}
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Plus className="mr-2" size={24} />
                  Ajouter un Personnel
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-blue-200 transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Entrez le prénom"
                  />
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Entrez le nom"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="exemple@email.com"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="695683485"
                  />
                </div>

                {/* Quartier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quartier *
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Entrez le quartier"
                  />
                </div>

                {/* Salaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salaire (XAF) *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="2500000"
                  />
                </div>

                {/* Type de shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de shift *
                  </label>
                  <select
                    name="shift_type"
                    value={formData.shift_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  >
                    <option value="day">Jour</option>
                    <option value="night">Nuit</option>
                  </select>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="123 rue principale"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Créer Personnel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;