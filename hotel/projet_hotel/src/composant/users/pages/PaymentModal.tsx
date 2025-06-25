import React, { useState } from 'react';

type PaymentMethod = 'orange' | 'mtn';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');
    
    // Limiter à 9 chiffres après le 237
    if (numbers.length <= 9) {
      return numbers;
    }
    return numbers.substring(0, 9);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Vérifier si le numéro a exactement 9 chiffres
    if (phone.length !== 9) return false;
    
    // Vérifier les préfixes selon l'opérateur
    if (selectedMethod === 'orange') {
      // Orange : 69, 65, 66, 67
      return /^(69|65|66|67)/.test(phone);
    } else if (selectedMethod === 'mtn') {
      // MTN : 67, 65, 68, 65
      return /^(67|65|68|64)/.test(phone);
    }
    
    return false;
  };

  const sendConfirmationMessage = async (phone: string) => {
    // Simuler l'envoi d'un message de confirmation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Message de confirmation envoyé au +237${phone}`);
        console.log(`Montant: ${amount.toLocaleString()} XAF`);
        console.log(`Opérateur: ${selectedMethod.toUpperCase()}`);
        resolve(true);
      }, 2000);
    });
  };

  const handlePayment = async () => {
    setError(null);
    
    // Validation du numéro
    if (!validatePhoneNumber(phoneNumber)) {
      const operatorName = selectedMethod === 'orange' ? 'Orange' : 'MTN';
      const prefixes = selectedMethod === 'orange' 
        ? '69, 65, 66, 67' 
        : '67, 65, 68, 64';
      
      setError(`Numéro ${operatorName} invalide. Les préfixes valides sont: ${prefixes}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Simuler le processus de paiement
      await sendConfirmationMessage(phoneNumber);
      setConfirmationSent(true);
      
      // Attendre un délai simulé pour le "paiement"
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess();
      }, 3000);
      
    } catch {
      setError('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Paiement Mobile Money
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!confirmationSent ? (
          <>
            {/* Montant à payer */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="text-center">
                <span className="text-lg font-bold text-blue-800">
                  Montant à payer: {amount.toLocaleString()} XAF
                </span>
              </div>
            </div>

            {/* Sélection de l'opérateur */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">
                Choisissez votre opérateur
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('orange')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                    selectedMethod === 'orange'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-sm">OM</span>
                  </div>
                  <span className="font-medium">Orange Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('mtn')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                    selectedMethod === 'mtn'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-300 hover:border-yellow-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-sm">MTN</span>
                  </div>
                  <span className="font-medium">MTN Mobile Money</span>
                </button>
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Numéro de téléphone
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  +237
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="6XXXXXXXX"
                  className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={9}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {selectedMethod === 'orange' 
                  ? 'Préfixes Orange: 69, 65, 66, 67'
                  : 'Préfixes MTN: 67, 65, 68, 64'
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={isProcessing}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handlePayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isProcessing || !phoneNumber}
              >
                {isProcessing ? 'Traitement...' : 'Payer'}
              </button>
            </div>
          </>
        ) : (
          /* Message de confirmation */
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Message de confirmation envoyé !
              </h3>
              <p className="text-gray-600 mb-4">
                Un message de confirmation a été envoyé au numéro<br />
                <strong>+237 {phoneNumber}</strong>
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Veuillez confirmer le paiement de <strong>{amount.toLocaleString()} XAF</strong> sur votre téléphone.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Traitement en cours...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;