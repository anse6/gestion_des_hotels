from flask import Blueprint, request, jsonify
from sqlalchemy.sql import text
from sqlalchemy import func
from app.extensions import db
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any

chatbot_bp = Blueprint('chatbot_bp', __name__)

class HotelChatbot:
    def __init__(self):
        # Villes du Cameroun
        self.villes_cameroun = [
            'yaoundé', 'douala', 'bamenda', 'bafoussam', 'garoua', 'maroua',
            'ngaoundéré', 'bertoua', 'ebolowa', 'kumba', 'limbe', 'buea',
            'mbouda', 'foumban', 'dschang', 'kribi', 'edéa', 'sangmélima',
            'abong-mbang', 'mbalmayo', 'yokadouma', 'batouri', 'kousséri',
            'wum', 'fundong', 'nkongsamba', 'loum', 'tiko', 'mutengene'
        ]
        
        # Mots-clés pour les requêtes
        self.keywords = {
            'prix': ['prix', 'coût', 'tarif', 'cher', 'pas cher', 'moins cher', 'plus cher', 'économique', 'budget'],
            'disponible': ['disponible', 'libre', 'réservé', 'occupé', 'dispo'],
            'chambre': ['chambre', 'room', 'lit', 'dormir'],
            'appartement': ['appartement', 'studio', 'suite'],
            'salle': ['salle', 'fête', 'événement', 'mariage', 'conférence', 'meeting'],
            'hotel': ['hôtel', 'hotel', 'établissement', 'hébergement'],
            'etoiles': ['étoile', 'étoiles', 'star', 'standing', 'luxe'],
            'services': ['service', 'wifi', 'piscine', 'restaurant', 'parking', 'climatisation'],
            'reservation': ['réservation', 'réserver', 'booking', 'réserver']
        }

    def normaliser_message(self, message: str) -> str:
        """Normalise le message pour faciliter l'analyse"""
        message = message.lower().strip()
        # Supprimer les accents
        accents = {'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'à': 'a', 'â': 'a', 'ä': 'a', 
                  'ù': 'u', 'û': 'u', 'ü': 'u', 'ô': 'o', 'ö': 'o', 'î': 'i', 'ï': 'i',
                  'ç': 'c', 'ñ': 'n'}
        for accent, normal in accents.items():
            message = message.replace(accent, normal)
        return message

    def extraire_ville(self, message: str) -> str:
        """Extrait le nom de la ville du message"""
        message_norm = self.normaliser_message(message)
        for ville in self.villes_cameroun:
            if ville in message_norm:
                return ville.capitalize()
        return None

    def extraire_nombre_etoiles(self, message: str) -> int:
        """Extrait le nombre d'étoiles du message"""
        nombres = re.findall(r'\b([1-5])\b', message)
        for nombre in nombres:
            if any(keyword in message for keyword in self.keywords['etoiles']):
                return int(nombre)
        return None

    def detecter_intention(self, message: str) -> Dict[str, Any]:
        """Détecte l'intention de l'utilisateur"""
        message_norm = self.normaliser_message(message)
        intentions = {
            'type_logement': None,
            'ville': self.extraire_ville(message),
            'prix': False,
            'disponibilite': False,
            'etoiles': self.extraire_nombre_etoiles(message),
            'comparaison': False,
            'liste': False,
            'reservation': False
        }

        # Détecter le type de logement
        if any(keyword in message_norm for keyword in self.keywords['chambre']):
            intentions['type_logement'] = 'chambre'
        elif any(keyword in message_norm for keyword in self.keywords['appartement']):
            intentions['type_logement'] = 'appartement'
        elif any(keyword in message_norm for keyword in self.keywords['salle']):
            intentions['type_logement'] = 'salle'
        elif any(keyword in message_norm for keyword in self.keywords['hotel']):
            intentions['type_logement'] = 'hotel'

        # Détecter les autres intentions
        intentions['prix'] = any(keyword in message_norm for keyword in self.keywords['prix'])
        intentions['disponibilite'] = any(keyword in message_norm for keyword in self.keywords['disponible'])
        intentions['reservation'] = any(keyword in message_norm for keyword in self.keywords['reservation'])
        intentions['liste'] = any(word in message_norm for word in ['liste', 'tous', 'toutes', 'quels', 'quelles'])
        intentions['comparaison'] = any(word in message_norm for word in ['comparer', 'différence', 'mieux', 'meilleur'])

        return intentions

    def obtenir_hotels_par_ville(self, ville: str) -> List[Dict]:
        """Obtient la liste des hôtels d'une ville"""
        try:
            query = text("""
                SELECT h.name, h.stars, h.city, h.phone, h.email, h.description
                FROM hotels h 
                WHERE LOWER(h.city) = :ville
                ORDER BY h.stars DESC, h.name ASC
            """)
            result = db.session.execute(query, {'ville': ville.lower()})
            return [dict(row._mapping) for row in result.fetchall()]
        except Exception as e:
            return []

    def obtenir_chambres_pas_cheres(self, ville: str = None, limite: int = 5) -> List[Dict]:
        """Obtient les chambres les moins chères"""
        try:
            base_query = """
                SELECT r.room_number, r.price_per_night, r.room_type, h.name as hotel_name, h.city
                FROM rooms r
                JOIN hotels h ON r.hotel_id = h.id
                WHERE r.is_available = 1
            """
            
            if ville:
                base_query += " AND LOWER(h.city) = :ville"
                params = {'ville': ville.lower()}
            else:
                params = {}
            
            base_query += " ORDER BY r.price_per_night ASC LIMIT :limite"
            params['limite'] = limite
            
            query = text(base_query)
            result = db.session.execute(query, params)
            return [dict(row._mapping) for row in result.fetchall()]
        except Exception as e:
            return []

    def obtenir_appartements_pas_chers(self, ville: str = None, limite: int = 5) -> List[Dict]:
        """Obtient les appartements les moins chers"""
        try:
            base_query = """
                SELECT a.name, a.price_per_night, a.apartment_type, h.name as hotel_name, h.city
                FROM apartments a
                JOIN hotels h ON a.hotel_id = h.id
                WHERE a.is_available = 1
            """
            
            if ville:
                base_query += " AND LOWER(h.city) = :ville"
                params = {'ville': ville.lower()}
            else:
                params = {}
            
            base_query += " ORDER BY a.price_per_night ASC LIMIT :limite"
            params['limite'] = limite
            
            query = text(base_query)
            result = db.session.execute(query, params)
            return [dict(row._mapping) for row in result.fetchall()]
        except Exception as e:
            return []

    def obtenir_salles_evenements(self, ville: str = None, limite: int = 5) -> List[Dict]:
        """Obtient les salles d'événements"""
        try:
            base_query = """
                SELECT e.name, e.rental_price, e.capacity, h.name as hotel_name, h.city
                FROM event_rooms e
                JOIN hotels h ON e.hotel_id = h.id
                WHERE e.is_available = 1
            """
            
            if ville:
                base_query += " AND LOWER(h.city) = :ville"
                params = {'ville': ville.lower()}
            else:
                params = {}
            
            base_query += " ORDER BY e.rental_price ASC LIMIT :limite"
            params['limite'] = limite
            
            query = text(base_query)
            result = db.session.execute(query, params)
            return [dict(row._mapping) for row in result.fetchall()]
        except Exception as e:
            return []

    def obtenir_statistiques_ville(self, ville: str) -> Dict:
        """Obtient les statistiques d'une ville"""
        try:
            query = text("""
                SELECT 
                    COUNT(DISTINCT h.id) as nb_hotels,
                    COUNT(DISTINCT r.id) as nb_chambres,
                    COUNT(DISTINCT a.id) as nb_appartements,
                    COUNT(DISTINCT e.id) as nb_salles,
                    AVG(r.price_per_night) as prix_moyen_chambre,
                    MIN(r.price_per_night) as prix_min_chambre,
                    MAX(r.price_per_night) as prix_max_chambre
                FROM hotels h
                LEFT JOIN rooms r ON h.id = r.hotel_id
                LEFT JOIN apartments a ON h.id = a.hotel_id
                LEFT JOIN event_rooms e ON h.id = e.hotel_id
                WHERE LOWER(h.city) = :ville
            """)
            result = db.session.execute(query, {'ville': ville.lower()})
            row = result.fetchone()
            return dict(row._mapping) if row else {}
        except Exception as e:
            return {}

    def obtenir_disponibilites(self, ville: str = None) -> Dict:
        """Obtient les disponibilités actuelles"""
        try:
            base_query = """
                SELECT 
                    h.city,
                    COUNT(CASE WHEN r.is_available = 1 THEN 1 END) as chambres_disponibles,
                    COUNT(CASE WHEN a.is_available = 1 THEN 1 END) as appartements_disponibles,
                    COUNT(CASE WHEN e.is_available = 1 THEN 1 END) as salles_disponibles
                FROM hotels h
                LEFT JOIN rooms r ON h.id = r.hotel_id
                LEFT JOIN apartments a ON h.id = a.hotel_id
                LEFT JOIN event_rooms e ON h.id = e.hotel_id
            """
            
            if ville:
                base_query += " WHERE LOWER(h.city) = :ville"
                params = {'ville': ville.lower()}
            else:
                params = {}
            
            base_query += " GROUP BY h.city ORDER BY h.city"
            
            query = text(base_query)
            result = db.session.execute(query, params)
            return [dict(row._mapping) for row in result.fetchall()]
        except Exception as e:
            return []

    def generer_reponse(self, message: str) -> str:
        """Génère une réponse basée sur le message"""
        intentions = self.detecter_intention(message)
        
        # Salutations
        if any(salut in message.lower() for salut in ['bonjour', 'bonsoir', 'salut', 'hello']):
            return "Bonjour ! Je suis votre assistant hôtelier pour le Cameroun. Comment puis-je vous aider aujourd'hui ? Je peux vous renseigner sur les hôtels, chambres, appartements et salles d'événements dans toutes les villes du Cameroun."

        # Aide
        if any(aide in message.lower() for aide in ['aide', 'help', 'comment', 'que peux-tu']):
            return """Je peux vous aider avec :
            
• 🏨 **Hôtels** : Trouver des hôtels dans toutes les villes du Cameroun
• 🛏️ **Chambres** : Prix, disponibilité, types de chambres
• 🏠 **Appartements** : Studios, suites, appartements meublés
• 🎉 **Salles d'événements** : Mariages, conférences, fêtes
• 💰 **Prix** : Comparaisons, options économiques
• 📍 **Villes** : Yaoundé, Douala, Bamenda, Bafoussam, Buea, Mbouda, etc.

Exemples de questions :
- "Quels hôtels à Yaoundé ?"
- "Chambre pas chère à Douala"
- "Appartement disponible à Bafoussam"
- "Salle de mariage à Buea"
"""

        # Réponses spécifiques selon les intentions
        if intentions['type_logement'] == 'hotel':
            return self.repondre_hotels(intentions)
        elif intentions['type_logement'] == 'chambre':
            return self.repondre_chambres(intentions)
        elif intentions['type_logement'] == 'appartement':
            return self.repondre_appartements(intentions)
        elif intentions['type_logement'] == 'salle':
            return self.repondre_salles(intentions)
        elif intentions['ville'] and intentions['disponibilite']:
            return self.repondre_disponibilites(intentions)
        elif intentions['ville']:
            return self.repondre_ville_generale(intentions)
        else:
            return self.reponse_par_defaut()

    def repondre_hotels(self, intentions: Dict) -> str:
        """Répond aux questions sur les hôtels"""
        ville = intentions['ville']
        etoiles = intentions['etoiles']
        
        if ville:
            hotels = self.obtenir_hotels_par_ville(ville)
            if not hotels:
                return f"Désolé, je n'ai pas trouvé d'hôtels à {ville.capitalize()}. Voulez-vous que je vous propose des hôtels dans d'autres villes ?"
            
            if etoiles:
                hotels = [h for h in hotels if h['stars'] == etoiles]
                if not hotels:
                    return f"Aucun hôtel {etoiles} étoiles trouvé à {ville.capitalize()}."
            
            reponse = f"🏨 **Hôtels à {ville.capitalize()}** :\n\n"
            for hotel in hotels[:10]:  # Limiter à 10 résultats
                etoiles_str = "⭐" * (hotel['stars'] or 0)
                reponse += f"• **{hotel['name']}** {etoiles_str}\n"
                if hotel['phone']:
                    reponse += f"  📞 {hotel['phone']}\n"
                if hotel['email']:
                    reponse += f"  📧 {hotel['email']}\n"
                reponse += "\n"
            
            return reponse
        
        return "Dans quelle ville recherchez-vous un hôtel ? (Yaoundé, Douala, Bamenda, Bafoussam, Buea, Mbouda, etc.)"

    def repondre_chambres(self, intentions: Dict) -> str:
        """Répond aux questions sur les chambres"""
        ville = intentions['ville']
        prix = intentions['prix']
        
        if prix:
            chambres = self.obtenir_chambres_pas_cheres(ville, 10)
            if not chambres:
                return f"Désolé, aucune chambre disponible trouvée{f' à {ville.capitalize()}' if ville else ''}."
            
            reponse = f"🛏️ **Chambres les moins chères{f' à {ville.capitalize()}' if ville else ''}** :\n\n"
            for chambre in chambres:
                reponse += f"• **Chambre {chambre['room_number']}** - {chambre['room_type']}\n"
                reponse += f"  🏨 {chambre['hotel_name']} ({chambre['city']})\n"
                reponse += f"  💰 {chambre['price_per_night']:,} FCFA/nuit\n\n"
            
            return reponse
        
        return "Recherchez-vous des chambres pas chères ? Dans quelle ville ?"

    def repondre_appartements(self, intentions: Dict) -> str:
        """Répond aux questions sur les appartements"""
        ville = intentions['ville']
        prix = intentions['prix']
        
        if prix or not ville:
            appartements = self.obtenir_appartements_pas_chers(ville, 10)
            if not appartements:
                return f"Désolé, aucun appartement disponible trouvé{f' à {ville.capitalize()}' if ville else ''}."
            
            reponse = f"🏠 **Appartements{f' à {ville.capitalize()}' if ville else ''}** :\n\n"
            for apt in appartements:
                reponse += f"• **{apt['name']}** - {apt['apartment_type']}\n"
                reponse += f"  🏨 {apt['hotel_name']} ({apt['city']})\n"
                reponse += f"  💰 {apt['price_per_night']:,} FCFA/nuit\n\n"
            
            return reponse
        
        return "Dans quelle ville recherchez-vous un appartement ?"

    def repondre_salles(self, intentions: Dict) -> str:
        """Répond aux questions sur les salles d'événements"""
        ville = intentions['ville']
        
        salles = self.obtenir_salles_evenements(ville, 10)
        if not salles:
            return f"Désolé, aucune salle d'événement disponible trouvée{f' à {ville.capitalize()}' if ville else ''}."
        
        reponse = f"🎉 **Salles d'événements{f' à {ville.capitalize()}' if ville else ''}** :\n\n"
        for salle in salles:
            reponse += f"• **{salle['name']}**\n"
            reponse += f"  🏨 {salle['hotel_name']} ({salle['city']})\n"
            reponse += f"  👥 Capacité : {salle['capacity']} personnes\n"
            reponse += f"  💰 {salle['rental_price']:,} FCFA\n\n"
        
        return reponse

    def repondre_disponibilites(self, intentions: Dict) -> str:
        """Répond aux questions sur les disponibilités"""
        ville = intentions['ville']
        
        disponibilites = self.obtenir_disponibilites(ville)
        if not disponibilites:
            return f"Désolé, aucune information de disponibilité trouvée{f' pour {ville.capitalize()}' if ville else ''}."
        
        reponse = f"📋 **Disponibilités{f' à {ville.capitalize()}' if ville else ''}** :\n\n"
        for dispo in disponibilites:
            reponse += f"🏙️ **{dispo['city']}** :\n"
            reponse += f"  • 🛏️ Chambres : {dispo['chambres_disponibles']} disponibles\n"
            reponse += f"  • 🏠 Appartements : {dispo['appartements_disponibles']} disponibles\n"
            reponse += f"  • 🎉 Salles : {dispo['salles_disponibles']} disponibles\n\n"
        
        return reponse

    def repondre_ville_generale(self, intentions: Dict) -> str:
        """Répond aux questions générales sur une ville"""
        ville = intentions['ville']
        
        stats = self.obtenir_statistiques_ville(ville)
        if not stats or stats.get('nb_hotels', 0) == 0:
            return f"Désolé, je n'ai pas d'informations sur {ville.capitalize()}. Essayez Yaoundé, Douala, Bamenda, Bafoussam, Buea, Mbouda, etc."
        
        reponse = f"📊 **Informations sur {ville.capitalize()}** :\n\n"
        reponse += f"🏨 **{stats['nb_hotels']} hôtels** disponibles\n"
        reponse += f"🛏️ **{stats['nb_chambres']} chambres** au total\n"
        reponse += f"🏠 **{stats['nb_appartements']} appartements** disponibles\n"
        reponse += f"🎉 **{stats['nb_salles']} salles d'événements**\n\n"
        
        if stats.get('prix_moyen_chambre'):
            reponse += f"💰 **Prix des chambres** :\n"
            reponse += f"  • Moyenne : {stats['prix_moyen_chambre']:,.0f} FCFA/nuit\n"
            reponse += f"  • Minimum : {stats['prix_min_chambre']:,} FCFA/nuit\n"
            reponse += f"  • Maximum : {stats['prix_max_chambre']:,} FCFA/nuit\n\n"
        
        reponse += f"Que souhaitez-vous savoir de plus sur {ville.capitalize()} ?"
        
        return reponse

    def reponse_par_defaut(self) -> str:
        """Réponse par défaut"""
        return """Je n'ai pas bien compris votre demande. Voici ce que je peux faire :

🏨 **Hôtels** : "Hôtels à Yaoundé", "Hôtels 4 étoiles"
🛏️ **Chambres** : "Chambre pas chère à Douala", "Chambres disponibles"
🏠 **Appartements** : "Appartement à Bafoussam", "Studio économique"
🎉 **Salles** : "Salle de mariage à Buea", "Salle de conférence"

**Villes disponibles** : Yaoundé, Douala, Bamenda, Bafoussam, Buea, Mbouda, Garoua, Maroua, Ngaoundéré, Bertoua, Ebolowa, Kumba, Limbe, Dschang, Kribi, et bien d'autres !

Reformulez votre question ou tapez "aide" pour plus d'informations."""

# Instance du chatbot
chatbot = HotelChatbot()

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint principal du chatbot"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                "error": "Message manquant",
                "response": "Veuillez fournir un message."
            }), 400
        
        message = data['message'].strip()
        if not message:
            return jsonify({
                "response": "Bonjour ! Comment puis-je vous aider avec vos recherches d'hôtels au Cameroun ?"
            })
        
        # Générer la réponse
        response = chatbot.generer_reponse(message)
        
        return jsonify({
            "response": response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "error": "Erreur serveur",
            "response": "Désolé, une erreur s'est produite. Veuillez réessayer."
        }), 500

@chatbot_bp.route('/api/chat/suggestions', methods=['GET'])
def get_suggestions():
    """Endpoint pour obtenir des suggestions de questions"""
    suggestions = [
        "Quels hôtels à Yaoundé ?",
        "Chambre pas chère à Douala",
        "Appartement disponible à Bafoussam",
        "Salle de mariage à Buea",
        "Hôtels 4 étoiles au Cameroun",
        "Prix des chambres à Bamenda",
        "Appartements à Mbouda",
        "Disponibilités à Garoua",
        "Salles de conférence à Ngaoundéré",
        "Hôtels économiques à Kribi"
    ]
    
    return jsonify({
        "suggestions": suggestions,
        "villes": chatbot.villes_cameroun
    })

@chatbot_bp.route('/api/chat/villes', methods=['GET'])
def get_villes():
    """Endpoint pour obtenir la liste des villes"""
    return jsonify({
        "villes": [ville.capitalize() for ville in chatbot.villes_cameroun]
    })