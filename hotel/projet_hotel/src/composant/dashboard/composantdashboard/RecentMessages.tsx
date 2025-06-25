import React from 'react';
import { MessageSquare, User } from 'lucide-react';

interface AdminMessage {
  id: string;
  sender: 'superadmin' | 'admin';
  adminName: string;
  hotelName: string;
  content: string;
  time: string;
  unread: boolean;
}

const AdminDiscussions: React.FC = () => {
  const messages: AdminMessage[] = [
    {
      id: '1',
      sender: 'admin',
      adminName: 'Pierre Dubois',
      hotelName: 'Hôtel Belle Vue',
      content: 'Bonjour, nous avons un problème avec le système de réservation. Pouvez-vous vérifier ?',
      time: 'Il y a 15 min',
      unread: true
    },
    {
      id: '2',
      sender: 'superadmin',
      adminName: 'Vous',
      hotelName: 'Hôtel Belle Vue',
      content: 'Je regarde ça immédiatement. Avez-vous des captures d\'écran ?',
      time: 'Il y a 10 min',
      unread: false
    },
    {
      id: '3',
      sender: 'admin',
      adminName: 'Marie Lambert',
      hotelName: 'Sunset Resort',
      content: 'Le rapport mensuel est prêt à être validé.',
      time: 'Hier, 16:30',
      unread: false
    },
    {
      id: '4',
      sender: 'admin',
      adminName: 'Thomas Leroy',
      hotelName: 'Alpine Lodge',
      content: 'Besoin d\'autorisation pour modifier les tarifs saisonniers.',
      time: 'Hier, 14:15',
      unread: true
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Discussions avec les Admins</h3>
        <MessageSquare className="text-gray-400" />
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-3 rounded-lg ${message.unread ? 'bg-blue-50' : 'bg-white'} border border-gray-100 hover:border-blue-200 transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${message.sender === 'superadmin' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <User size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">
                    {message.adminName} 
                    <span className="text-gray-500 text-sm font-normal"> - {message.hotelName}</span>
                  </h4>
                  <p className={`text-sm ${message.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {message.content}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{message.time}</span>
            </div>
            
            {message.unread && (
              <div className="flex justify-end mt-1">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Nouveau</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 border-t border-gray-100 pt-4">
        <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
          <MessageSquare size={16} />
          Nouvelle discussion
        </button>
      </div>
    </div>
  );
};

export default AdminDiscussions;