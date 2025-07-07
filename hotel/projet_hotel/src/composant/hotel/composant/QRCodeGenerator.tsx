// QRCodeGenerator.tsx
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  qrCodeValue: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ qrCodeValue }) => {
  return (
    <div className="flex flex-col items-center bg-white shadow p-4 rounded">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">QR Code du personnel</h2>
      <QRCodeSVG value={qrCodeValue} size={200} />
      <p className="mt-2 text-sm text-gray-500 break-all">{qrCodeValue}</p>
    </div>
  );
};

export default QRCodeGenerator;
