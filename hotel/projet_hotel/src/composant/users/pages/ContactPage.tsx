import React, { useState } from 'react';
import axios from 'axios';
import Header from '../composant/Header';
import Footer from '../composant/Footer';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await axios.post('http://localhost:5000/api/contact/', formData);
      console.log('Message envoyé avec succès:', response.data);
      setSuccessMessage('Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.');
      // Réinitialiser le formulaire après succès
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Erreur lors de l\'envoi du message:', err.response?.data || err.message);
        setErrorMessage(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
      } else {
        console.error('Erreur inattendue:', err);
        setErrorMessage('Une erreur inattendue est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 to-blue-600 text-white py-32 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0">
            <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full -top-48 -left-48 animate-pulse-slow"></div>
            <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full -bottom-48 -right-48 animate-pulse-slow delay-1000"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-down">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Contactez-nous
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
                Notre équipe est à votre disposition pour répondre à toutes vos questions et demandes avec professionnalisme.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:shadow-2xl animate-fade-in-up">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Envoyez-nous un message</h2>

                {successMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Succès !</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Erreur !</strong>
                    <span className="block sm:inline"> {errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-gray-700 font-medium mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                        placeholder="Votre prénom"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-gray-700 font-medium mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                        placeholder="Votre nom"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      placeholder="Votre email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                      Sujet
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="Réservation">Réservation</option>
                      <option value="Demande d'information">Demande d'information</option>
                      <option value="Demande groupe/événement">Demande groupe/événement</option>
                      <option value="Autre demande">Autre demande</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      placeholder="Votre message..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 hover:scale-105 transition duration-300 transform"
                    disabled={loading} // Désactive le bouton pendant le chargement
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl shadow-xl p-8 h-full transform transition-all duration-500 hover:shadow-2xl animate-fade-in-up delay-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Nos coordonnées</h2>

                <div className="space-y-8">
                  <div className="flex items-start group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition duration-300">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Adresse</h3>
                      <p className="text-gray-600">BP 1234, Avenue des Hôtels<br />Yaoundé, Cameroun</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition duration-300">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Téléphone</h3>
                      <p className="text-gray-600">+237 6 95 683 485<br />+237 652 021 433</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition duration-300">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">Anseehoʊ.t̬əl@gmail.com<br />reservation@Anseehoʊ.t̬əl.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="container mx-auto px-4 pb-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 animate-fade-in-up delay-400">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.490347538304!2d11.51886031475737!3d3.866878997256097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf7a5c0e4c3d%3A0x1e4e4b1e6a0e4c3d!2sYaound%C3%A9%2C%20Cameroun!5e0!3m2!1sfr!2sfr!4v1620000000000!5m2!1sfr!2sfr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Carte de localisation"
            ></iframe>
          </div>
        </section>
      </div>

      <Footer />
      <style>
        {`
          @keyframes fadeInDown {
            0% { transform: translateY(-20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeInUp {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulseSlow {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
          }
          .animate-fade-in-down { animation: fadeInDown 1s ease-out forwards; }
          .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
          .animate-pulse-slow { animation: pulseSlow 3s infinite ease-in-out; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-1000 { animation-delay: 1s; }
        `}
      </style>
    </>
  );
};

export default ContactPage;