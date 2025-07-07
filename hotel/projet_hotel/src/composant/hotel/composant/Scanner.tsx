import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

interface CheckInResponse {
  deduction: number;
  message: string;
  status: string;
}

interface CheckOutResponse {
  qr_code_id: string;
  device_id: string;
}

interface ApiError {
  message: string;
}

const Scanner = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckIn, setIsCheckIn] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (scanResult) => handleScan(scanResult.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      );

      qrScannerRef.current.start();

      return () => {
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        }
      };
    }
  }, []);

  const handleScan = async (qrData: string) => {
    if (loading) return;

    setResult(qrData);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = isCheckIn 
        ? 'http://localhost:5000/api/personnel/check-in' 
        : 'http://localhost:5000/api/personnel/check-out';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_code: qrData,
          device_id: 'YOUR_DEVICE_ID' // Remplacez par votre device ID ou récupérez-le dynamiquement
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Erreur inconnue');
      }

      const data: CheckInResponse | CheckOutResponse = await response.json();

      if (isCheckIn) {
        const checkInData = data as CheckInResponse;
        setSuccessMessage(`${checkInData.message} - Statut: ${checkInData.status}`);
      } else {
        const checkOutData = data as CheckOutResponse;
        setSuccessMessage(`Check-out enregistré pour ${checkOutData.qr_code_id}`);
      }

      // Réinitialiser le scanner après un court délai
      setTimeout(() => {
        setResult(null);
        setLoading(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const toggleCheckInOut = () => {
    setIsCheckIn(!isCheckIn);
    setResult(null);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">
        {isCheckIn ? 'Scanner pour Check-in' : 'Scanner pour Check-out'}
      </h1>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <video 
          ref={videoRef} 
          className="w-full h-64 object-cover"
          playsInline
        />
      </div>

      <button
        onClick={toggleCheckInOut}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Basculer vers {isCheckIn ? 'Check-out' : 'Check-in'}
      </button>

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          Traitement en cours...
        </div>
      )}

      {result && (
        <div className="mb-4 p-3 bg-gray-200 rounded">
          <p className="font-semibold">Code QR scanné:</p>
          <p className="truncate">{result}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Erreur: {error}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>Instructions:</p>
        <ul className="list-disc pl-5">
          <li>Placez le code QR devant la caméra</li>
          <li>Assurez-vous d'avoir une bonne luminosité</li>
          <li>Maintenez le code stable pendant la lecture</li>
        </ul>
      </div>
    </div>
  );
};

export default Scanner;