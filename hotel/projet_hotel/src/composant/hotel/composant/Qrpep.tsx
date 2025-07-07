import QRCodeGenerator from './QRCodeGenerator';

const ExemplePage = () => {
  const qrCodeId = "PERS-1-fd88dd1c-5d16-41a2-85c7-41b8fb0568d6";

  return (
    <div className="p-6">
      <QRCodeGenerator qrCodeValue={qrCodeId} />
    </div>
  );
};

export default ExemplePage;
