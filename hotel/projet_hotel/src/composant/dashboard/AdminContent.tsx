// src/composant/dashboard/AdminContent.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Edit, X, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Admin {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

const fetchAdmins = async () => {
  const res = await axios.get<Admin[]>('http://localhost:5000/api/auth/admin');
  return res.data;
};

const createAdmin = async (admin: { name: string; email: string; password: string }) => {
  const res = await axios.post('http://localhost:5000/api/auth/admin/create', admin);
  return res.data;
};

const updateAdmin = async ({ id, ...admin }: { id: number; name: string; email: string; password?: string }) => {
  const res = await axios.put(`http://localhost:5000/api/auth/user/${id}`, admin);
  return res.data;
};

const toggleAdminStatus = async ({ id, is_active }: { id: number; is_active: boolean }) => {
  const res = await axios.put(`http://localhost:5000/api/auth/admin/${id}/status`, { is_active });
  return res.data;
};

const deleteAdmin = async (id: number) => {
  const res = await axios.delete(`http://localhost:5000/api/auth/user/${id}`);
  return res.data;
};

const AdminContent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: 'admin123' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: admins = [], isLoading, isError } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins
  });

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: 'admin123' });
      setSuccess("Administrateur créé avec succès");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: () => {
      setError("Erreur lors de la création de l'admin");
    }
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingAdmin(null);
      setFormData({ name: '', email: '', password: 'admin123' });
      setSuccess("Administrateur modifié avec succès");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: () => {
      setError("Erreur lors de la modification de l'admin");
    }
  });

  const { mutate: toggleStatusMutate } = useMutation({
    mutationFn: toggleAdminStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setSuccess(`Admin ${variables.is_active ? 'activé' : 'désactivé'} avec succès`);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: () => {
      setError("Erreur lors du changement de statut");
    }
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setSuccess("Administrateur supprimé avec succès");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: () => {
      setError("Erreur lors de la suppression de l'admin");
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || (!isEditMode && !formData.password)) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (isEditMode && editingAdmin) {
      const updateData = {
        id: editingAdmin.id,
        name: formData.name,
        email: formData.email,
        ...(formData.password && formData.password !== 'admin123' && { password: formData.password })
      };
      updateMutate(updateData);
    } else {
      createMutate(formData);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: ''
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutate(id);
  };

  const handleToggleStatus = (admin: Admin) => {
    const newStatus = !admin.is_active;
    toggleStatusMutate({ id: admin.id, is_active: newStatus });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: 'admin123' });
    setError(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 shadow-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-800"
        >
          Gestion des Administrateurs
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={18} /> Ajouter un admin
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                    Erreur de chargement des données
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucun administrateur trouvé
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <motion.tr 
                    key={admin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(admin)}
                          className={`${
                            admin.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                          } transition-colors p-1 rounded hover:bg-gray-50`}
                          title={admin.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {admin.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border-2 border-blue-500 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {isEditMode ? 'Modifier Administrateur' : 'Nouvel Administrateur'}
                  </h2>
                  <button 
                    onClick={handleCloseModal} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe {isEditMode ? '(laisser vide pour ne pas changer)' : '*'}
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required={!isEditMode}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isCreating || isUpdating}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isCreating || isUpdating ? 
                      (isEditMode ? 'Modification...' : 'Ajout...') : 
                      (isEditMode ? 'Modifier' : 'Créer')
                    }
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContent;